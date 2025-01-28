"use server";

import db from "@/db/drizzle";
import { profiles, swipes, matches } from "@/db/schema";
import { eq, and, not, isNull, or } from "drizzle-orm";
import { auth } from "@/auth";

export async function getSwipableProfiles() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    // First get the current user's profile to check their gender
    const currentUserProfile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
    });

    if (!currentUserProfile) return [];

    // Build the gender filter based on user's gender
    let genderFilter;
    if (currentUserProfile.gender?.toLowerCase() === "male") {
      genderFilter = eq(profiles.gender, "female");
    } else if (currentUserProfile.gender?.toLowerCase() === "female") {
      genderFilter = eq(profiles.gender, "male");
    } else {
      // For other genders, show all profiles
      genderFilter = not(eq(profiles.userId, session.user.id));
    }

    // Get profiles that:
    // 1. Match gender preferences
    // 2. Haven't been swiped on
    // 3. Are visible
    // 4. Aren't the current user
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
        isMatch: matches.id,
      })
      .from(profiles)
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
          genderFilter,
          eq(profiles.isVisible, true),
          isNull(swipes.id) // No previous swipe exists
        )
      )
      .limit(10);

    console.log(
      "Fetched profiles from database:",
      JSON.stringify(results, null, 2)
    );
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
          user1Id: session.user.id,
          user2Id: targetUserId,
          createdAt: new Date(),
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
    return { error: "Bestie, you need to sign in first 🔐" };

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
    console.error("Can't undo that bestie 😩", error);
    return { error: "No take-backsies rn, try again later 💅" };
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
        and(eq(swipes.swiperId, session.user.id), eq(swipes.isLike, true))
      );

    return {
      profiles: results.map((r) => ({ ...r.profile, isMatch: !!r.isMatch })),
      error: null,
    };
  } catch (error) {
    console.error("Error fetching liked profiles:", error);
    return { profiles: [], error: "Failed to fetch liked profiles" };
  }
}
