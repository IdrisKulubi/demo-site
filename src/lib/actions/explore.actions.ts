"use server";

import db from "@/db/drizzle";
import { profiles, swipes } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { auth } from "@/auth";

export async function getSwipableProfiles() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await db
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
      .limit(20);
  } catch (error) {
    console.error("OMG bestie, couldn't fetch profiles 😭", error);
    return [];
  }
}

export async function recordSwipe(swipedId: string, type: "like" | "pass") {
  const session = await auth();
  if (!session?.user?.id)
    return { error: "Bestie, you need to sign in first🔐" };

  try {
    await db.insert(swipes).values({
      swiperId: session.user.id,
      swipedId,
      type,
    });

    // Check for match
    const mutualLike = await db
      .select()
      .from(swipes)
      .where(
        and(
          eq(swipes.swiperId, swipedId),
          eq(swipes.swipedId, session.user.id),
          eq(swipes.type, "like")
        )
      )
      .limit(1);

    return { success: true, isMatch: mutualLike.length > 0 };
  } catch (error) {
    console.error("Yikes, swipe didn't work 🙈", error);
    return { error: "Oopsie! Something went wrong with your swipe 😅" };
  }
}

export async function undoLastSwipe() {
  const session = await auth();
  if (!session?.user?.id)
    return { error: "Bestie, you need to sign in first 🔐" };

  try {
    const lastSwipe = await db
      .select()
      .from(swipes)
      .where(eq(swipes.swiperId, session.user.id))
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
