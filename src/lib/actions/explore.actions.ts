/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import db from "@/db/drizzle";
import { profiles, swipes, matches, users, Profile } from "@/db/schema";
import { eq, and, not, isNull, or, sql, exists, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

type SwipeResult = 
  | { success: boolean; error: string; isMatch?: undefined; matchedProfile?: undefined }
  | { success: boolean; isMatch: boolean; error?: undefined; matchedProfile?: Profile }

export async function getSwipableProfiles() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    // First, get the current user's profile to know their gender
    const currentUserProfile = await db
      .select({
        gender: profiles.gender,
      })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!currentUserProfile.length || !currentUserProfile[0].gender) {
      return []; // Return empty if user hasn't set their gender
    }

    const userGender = currentUserProfile[0].gender;
    // Determine gender filter conditions based on user's gender
    const whereConditions = [
      not(eq(profiles.userId, session.user.id)),
      eq(profiles.isVisible, true),
      eq(profiles.profileCompleted, true),
      not(isNull(profiles.firstName)),
      not(isNull(profiles.lastName))
    ];

    // Only apply gender filter for binary genders (male/female)
    if (userGender === 'male') {
      whereConditions.push(eq(profiles.gender, 'female'));
    } else if (userGender === 'female') {
      whereConditions.push(eq(profiles.gender, 'male'));
    }
    // For non-binary and other genders, show all profiles (no gender filter)

    const totalProfiles = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles);

    const visibleProfiles = await db
      .select({ count: sql<number>`count(*)` })
      .from(profiles)
      .where(eq(profiles.isVisible, true));

    const results = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        bio: profiles.bio,
        age: profiles.age,
        gender: profiles.gender,
        interests: profiles.interests,
        photos: profiles.photos,
        course: profiles.course,
        yearOfStudy: profiles.yearOfStudy,
        profilePhoto: profiles.profilePhoto,
        phoneNumber: profiles.phoneNumber,
        lastActive: profiles.lastActive,
        isMatch: matches.id,
        isVisible: profiles.isVisible,
        isComplete: profiles.isComplete,
        profileCompleted: profiles.profileCompleted,
      })
      .from(profiles)
      .leftJoin(
        matches,
        and(
          or(
            and(
              eq(matches.user1Id, session.user.id),
              eq(matches.user2Id, profiles.userId)
            ),
            and(
              eq(matches.user2Id, session.user.id),
              eq(matches.user1Id, profiles.userId)
            )
          )
        )
      )
      .where(and(...whereConditions))
      .orderBy(sql`RANDOM()`)
      .limit(150);

    return results.map(profile => ({
      ...profile,
      isMatch: !!profile.isMatch
    }));
  } catch (error) {
    return [];
  }
}

export async function recordSwipe(
  profileId: string,
  type: "like" | "pass"
): Promise<{ success: boolean; error?: string; isMatch?: boolean; matchedProfile?: Profile }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if there's an existing swipe to prevent duplicates
    const existingSwipe = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.swipedId, profileId)
        )
      )
      .limit(1);

    if (existingSwipe.length > 0) {
      return { success: false, error: "Already swiped on this profile" };
    }

    // Record the swipe
    await db.insert(swipes).values({
      swiperId: session.user.id,
      swipedId: profileId,
      isLike: type === "like",
      createdAt: new Date(),
    });

    // If it's a like, check for a match
    if (type === "like") {
      const mutualLike = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.swiperId, profileId),
            eq(swipes.swipedId, session.user.id),
            eq(swipes.isLike, true)
          )
        )
        .limit(1);

      // If there's a mutual like, create a match
      if (mutualLike.length > 0) {
        await db.insert(matches).values({
          user1Id: session.user.id,
          user2Id: profileId,
          createdAt: new Date(),
        });

        const matchedProfile = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, profileId));

        return { success: true, isMatch: true, matchedProfile: matchedProfile[0] };
      }
    }

    return { success: true, isMatch: false };
  } catch (error) {
    console.error("Error recording swipe:", error);
    return { success: false, error: "Failed to record swipe" };
  }
}

export async function undoLastSwipe(swipedId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Delete the swipe directly
    await db
      .delete(swipes)
      .where(
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.swipedId, swipedId),
          eq(swipes.isLike, true)
        )
      );

    // Delete any potential match
    await db
      .delete(matches)
      .where(
        or(
          and(
            eq(matches.user1Id, session.user.id),
            eq(matches.user2Id, swipedId)
          ),
          and(
            eq(matches.user2Id, session.user.id),
            eq(matches.user1Id, swipedId)
          )
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error in undoLastSwipe:", error);
    return { error: "Failed to undo last swipe" };
  }
}

export async function getLikedProfiles() {
  const session = await auth();
  if (!session?.user?.id) {
    return { profiles: [], error: "Unauthorized" };
  }

  try {
    const results = await db
      .select({
        profile: profiles,
        isMatch: matches.id,
      })
      .from(swipes)
      .innerJoin(profiles, eq(profiles.userId, swipes.swipedId))
      .leftJoin(
        matches,
        and(
          or(
            and(
              eq(matches.user1Id, session.user.id),
              eq(matches.user2Id, profiles.userId)
            ),
            and(
              eq(matches.user2Id, session.user.id),
              eq(matches.user1Id, profiles.userId)
            )
          )
        )
      )
      .where(
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.isLike, true),
          isNull(matches.id)
        )
      );

    return {
      profiles: results.map((r) => ({ ...r.profile, isMatch: !!r.isMatch })),
      error: null,
    };
  } catch (error) {
    return { profiles: [], error: "Failed to fetch profiles" };
  }
}

export async function getLikedByProfiles() {
  const session = await auth();
  if (!session?.user?.id) {
    return { profiles: [], error: "Unauthorized" };
  }

  try {
    // Get profiles that have liked the current user but haven't been matched or passed
    const results = await db
      .select({
        profile: profiles,
      })
      .from(swipes)
      .innerJoin(profiles, eq(profiles.userId, swipes.swiperId))
      .where(
        and(
          eq(swipes.swipedId, session.user.id),
          eq(swipes.isLike, true),
          not(
            exists(
              db
                .select()
                .from(matches)
                .where(
                  or(
                    and(
                      eq(matches.user1Id, session.user.id),
                      eq(matches.user2Id, swipes.swiperId)
                    ),
                    and(
                      eq(matches.user2Id, session.user.id),
                      eq(matches.user1Id, swipes.swiperId)
                    )
                  )
                )
            )
          ),
          not(
            exists(
              db
                .select()
                .from(swipes)
                .where(
                  and(
                    eq(swipes.swiperId, session.user.id),
                    eq(swipes.swipedId, profiles.userId)
                  )
                )
            )
          )
        )
      );

    return {
      profiles: results.map((r) => r.profile),
      error: null,
    };
  } catch (error) {
    return { profiles: [], error: "Failed to fetch profiles" };
  }
}

export async function getTotalSwipes() {
  try {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(swipes);

    return { success: true, count: result[0].count };
  } catch (error) {
    console.error("Error getting total swipes:", error);
    return { success: false, count: 0 };
  }
}

export async function getMatches() {
  const session = await auth();
  if (!session?.user?.id) {
    return { matches: [], error: "Unauthorized" };
  }

  try {
    const results = await db
      .select({
        profile: profiles,
        matchedAt: matches.createdAt,
      })
      .from(matches)
      .innerJoin(
        profiles,
        or(
          and(
            eq(matches.user1Id, session.user.id),
            eq(profiles.userId, matches.user2Id)
          ),
          and(
            eq(matches.user2Id, session.user.id),
            eq(profiles.userId, matches.user1Id)
          )
        )
      )
      .orderBy(desc(matches.createdAt));

    return {
      matches: results.map((r) => ({
        ...r.profile,
        matchedAt: r.matchedAt,
      })),
      error: null,
    };
  } catch (error) {
    return { matches: [], error: "Failed to fetch matches" };
  }
}
