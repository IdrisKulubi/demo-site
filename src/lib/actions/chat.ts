"use server";

import db from "@/db/drizzle";
import { eq, and, or } from "drizzle-orm";
import { matches, profiles} from "@/db/schema";
import { auth } from "@/auth";

export async function getMatchDetails(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Find the match between current user and target user
  const match = await db.query.matches.findFirst({
    where: or(
      and(
        eq(matches.user1Id, session.user.id),
        eq(matches.user2Id, targetUserId)
      ),
      and(
        eq(matches.user1Id, targetUserId),
        eq(matches.user2Id, session.user.id)
      )
    ),
    columns: {
      id: true,
      user1Id: true,
      user2Id: true,
      createdAt: true,
    },
  });

  if (!match) throw new Error("Match not found");

  // Determine recipient ID
  const recipientId =
    match.user1Id === session.user.id ? match.user2Id : match.user1Id;

  // Get recipient profile with user data
  const recipient = (await db.query.profiles.findFirst({
    where: eq(profiles.userId, recipientId),
    with: {
      user: {
        columns: {
          id: true,
          isOnline: true,
          lastActive: true,
        },
      },
    },
  })) as
    | (typeof profiles.$inferSelect & {
        user: { isOnline: boolean; lastActive: Date; id: string };
      })
    | null;

  if (!recipient) throw new Error("Recipient profile not found");

  return {
    match,
    recipient: {
      ...recipient,
      userId: recipientId,
      isOnline: recipient.user?.isOnline ?? false,
      lastActive: recipient.user?.lastActive ?? new Date(),
    },
  };
}
