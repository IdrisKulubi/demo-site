"use server";

import db from "@/db/drizzle";
import { profiles, swipes, matches } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { auth } from "@/auth";
import { calculateCompatibility } from "@/lib/matching/algorithms";

export async function getSwipableProfiles() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const results = await db
      .select()
      .from(profiles)
      .leftJoin(
        swipes,
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.swipedId, profiles.userId)
        )
      )
      .where(
        and(
          not(eq(profiles.userId, session.user.id)),
          eq(profiles.isVisible, true)
        )
      )
      .limit(10);

    console.log(
      "Fetched profiles from database:",
      JSON.stringify(results, null, 2)
    );
    return results;
  } catch (error) {
    console.error("OMG bestie, couldn't fetch profiles 😭", error);
    return [];
  }
}

export async function recordSwipe(
  targetUserId: string,
  action: "like" | "pass"
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Prevent self-swiping
  if (targetUserId === session.user.id) {
    return { error: "Can't swipe yourself 😅" };
  }

  // Check for existing swipe
  const existingSwipe = await db
    .select()
    .from(swipes)
    .where(
      and(
        eq(swipes.swiperId, session.user.id),
        eq(swipes.swipedId, targetUserId)
      )
    )
    .limit(1);

  if (existingSwipe.length > 0) {
    return { error: "Already swiped on this profile 💅" };
  }

  // Record the swipe
  await db.insert(swipes).values({
    swiperId: session.user.id,
    swipedId: targetUserId,
    type: action,
    createdAt: new Date(),
  });

  let isMatch = false;

  if (action === "like") {
    // Check for mutual like and compatibility
    const [userProfile, targetProfile] = await Promise.all([
      db.query.profiles.findFirst({
        where: eq(profiles.userId, session.user.id),
      }),
      db.query.profiles.findFirst({
        where: eq(profiles.userId, targetUserId),
      }),
    ]);

    if (userProfile && targetProfile) {
      const mutualLike = await db
        .select()
        .from(swipes)
        .where(
          and(
            eq(swipes.swiperId, targetUserId),
            eq(swipes.swipedId, session.user.id),
            eq(swipes.type, "like")
          )
        )
        .limit(1);

      if (mutualLike.length > 0) {
        isMatch = calculateCompatibility(userProfile, targetProfile);

        if (isMatch) {
          await db.insert(matches).values({
            user1Id: session.user.id,
            user2Id: targetUserId,
            createdAt: new Date(),
          });
        }
      }
    }
  }

  return { success: true, isMatch };
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
    console.error("Can't undo that bestie! 😩", error);
    return { error: "No take-backsies rn, try again later 💅" };
  }
}
