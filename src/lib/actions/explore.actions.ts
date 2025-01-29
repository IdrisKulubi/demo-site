"use server";

import db from "@/db/drizzle";
import { profiles, swipes, matches, users } from "@/db/schema";
import { eq, and, not, isNull, or, sql } from "drizzle-orm";
import { auth } from "@/auth";

export async function getSwipableProfiles() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    // Get profiles that:
    // 1. Haven't been swiped on
    // 2. Are visible
    // 3. Aren't the current user
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
        phoneNumber: users.phoneNumber,
        isMatch: matches.id,
      })
      .from(profiles)
      .leftJoin(users, eq(users.id, profiles.userId))
      .leftJoin(
        swipes,
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.swipedId, profiles.userId)
        )
      )
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
          not(eq(profiles.userId, session.user.id)), // Not the current user
          eq(profiles.isVisible, true),
          isNull(swipes.id), // No previous swipe exists
          not(isNull(profiles.firstName)), // Required fields must not be null
          not(isNull(profiles.lastName)),
          not(isNull(profiles.bio)),
          not(isNull(profiles.age)),
          not(isNull(profiles.gender)),
          not(isNull(profiles.interests)),
          not(isNull(profiles.photos)),
          not(isNull(profiles.course)),
          not(isNull(profiles.yearOfStudy)),
          not(isNull(profiles.profilePhoto)),
          not(isNull(users.phoneNumber)),
          sql`jsonb_array_length(${profiles.photos}::jsonb) > 0`, // Photos array must not be empty
          sql`length(${profiles.bio}) > 0`, // Bio must not be empty
          sql`jsonb_array_length(${profiles.interests}::jsonb) > 0` // Interests array must not be empty
        )
      )
      .orderBy(sql`RANDOM()`)
      .limit(10);

    return results.map((r) => ({ ...r, isMatch: !!r.isMatch }));
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
}

export async function recordSwipe(
  targetUserId: string,
  action: "like" | "pass"
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Record the swipe
    await db.insert(swipes).values({
      swiperId: session.user.id,
      swipedId: targetUserId,
      isLike: action === "like",
      createdAt: new Date(),
    });

    // If it's a like, check for mutual like (match)
    if (action === "like") {
      const mutualLike = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.swiperId, targetUserId),
            eq(swipes.swipedId, session.user.id),
            eq(swipes.isLike, true)
          )
        )
        .limit(1);

      // If there's a mutual like, create a match
      if (mutualLike.length > 0) {
        await db.insert(matches).values({
          id: crypto.randomUUID(),
          user1Id: session.user.id,
          user2Id: targetUserId,
          createdAt: new Date(),
          lastMessageAt: null,
          user1Typing: false,
          user2Typing: false,
        });
        return { success: true, isMatch: true };
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
  if (!session?.user?.id)
    return { error: "Bestie, you need to sign in first " };

  try {
    const lastSwipe = await db
      .select()
      .from(swipes)
      .where(
        and(eq(swipes.swiperId, session.user.id), eq(swipes.swipedId, swipedId))
      )
      .orderBy(swipes.createdAt)
      .limit(1)
      .then(async (rows) => {
        if (rows.length === 0) return [];
        return db.delete(swipes).where(eq(swipes.id, rows[0].id)).returning();
      });

    return { success: true, lastSwipe };
  } catch (error) {
    console.error("Can't undo that bestie ", error);
    return { error: "No take-backsies rn, try again later " };
  }
}

export async function getLikedProfiles() {
  const session = await auth();
  if (!session?.user?.id) return { profiles: [], error: "Unauthorized" };

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
    console.error("Error fetching liked profiles:", error);
    return { profiles: [], error: "Failed to fetch profiles" };
  }
}

export async function getLikedByProfiles() {
  const session = await auth();
  if (!session?.user?.id) return { profiles: [], error: "Unauthorized" };

  try {

    const results = await db
      .select({
        profile: profiles,
        isMatch: matches.id,
        swipe: swipes,
      })
      .from(swipes)
      .innerJoin(profiles, eq(profiles.userId, swipes.swiperId))
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
          eq(swipes.swipedId, session.user.id),
          eq(swipes.isLike, true),
          isNull(matches.id)
        )
      );

  

    return {
      profiles: results.map((r) => ({ ...r.profile, isMatch: !!r.isMatch })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching profiles that liked you:", error);
    return { profiles: [], error: "Failed to fetch profiles" };
  }
}
