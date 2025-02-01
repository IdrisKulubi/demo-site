"use server";

import { swipes, matches } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { recordSwipe } from "./explore.actions";

/**
 * Handle liking a profile (swiping right)
 */
export async function handleLike(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await recordSwipe(targetUserId, "like");

    // No need to create match here since it's handled in recordSwipe
    revalidatePath("/explore");
    revalidatePath("/matches");

    return {
      success: true,
      isMatch: result.isMatch,
      matchedProfile: result.matchedProfile,
    };
  } catch (error) {
    console.error("Error in handleLike:", error);
    throw new Error("Failed to like profile");
  }
}

/**
 * Handle unliking a profile (removing the swipe)
 */
export async function handleUnlike(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Delete the swipe record
    await db
      .delete(swipes)
      .where(
        and(
          eq(swipes.swiperId, session.user.id),
          eq(swipes.swipedId, targetUserId)
        )
      );

    // Delete any potential match
    await db
      .delete(matches)
      .where(
        or(
          and(
            eq(matches.user1Id, session.user.id),
            eq(matches.user2Id, targetUserId)
          ),
          and(
            eq(matches.user2Id, session.user.id),
            eq(matches.user1Id, targetUserId)
          )
        )
      );

    revalidatePath("/explore");
    revalidatePath("/matches");

    return { success: true };
  } catch (error) {
    console.error("Error in handleUnlike:", error);
    throw new Error("Failed to unlike profile");
  }
}

/**
 * Check if current user has liked a profile
 */
export async function hasLiked(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  try {
    const existingSwipe = await db.query.swipes.findFirst({
      where: and(
        eq(swipes.swiperId, session.user.id),
        eq(swipes.swipedId, targetUserId),
        eq(swipes.isLike, true)
      ),
    });

    return !!existingSwipe;
  } catch (error) {
    console.error("Error in hasLiked:", error);
    return false;
  }
}
