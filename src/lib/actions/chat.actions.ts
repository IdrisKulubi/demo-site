'use server'

import  db  from "@/db/drizzle";
import { messages } from "@/db/schema";
import { auth } from "@/auth";
import { eq, } from "drizzle-orm";

export async function getChatMessages(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) return { messages: [], error: "Unauthorized" };

  try {
    const messageResults = await db.query.messages.findMany({
      where: eq(messages.matchId, matchId),
      orderBy: (msg, { desc }) => [desc(msg.createdAt)],
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return { 
      messages: messageResults.reverse(),
      error: null 
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { messages: [], error: "Failed to load messages" };
  }
}

export async function sendMessage(
  matchId: string,
  content: string,
  senderId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: null, error: "Unauthorized" };
  }

  try {
    const [message] = await db
      .insert(messages)
      .values({
        id: crypto.randomUUID(),
        matchId,
        senderId,
        content,
        status: "delivered",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return { message, error: null };
  } catch (error) {
    console.error("Error sending message:", error);
    return { message: null, error: "Failed to send message" };
  }
}

export async function getMatchDetails(matchId: string, currentUserId: string) {
  const match = await db.query.matches.findFirst({
    where: (matches, { eq, and, or }) => and(
      eq(matches.id, matchId),
      or(
        eq(matches.user1Id, currentUserId),
        eq(matches.user2Id, currentUserId)
      )
    ),
    with: {
      user1: {
        columns: {
          id: true
        },
        with: {
          profile: true
        }
      },
      user2: {
        columns: {
          id: true
        },
        with: {
          profile: true
        }
      }
    }
  });

  if (!match) {
    throw new Error("Match not found or unauthorized");
  }

  // Determine partner based on current user
  const partner = match.user1.id === currentUserId 
    ? match.user2.profile 
    : match.user1.profile;

  return { match, partner };
} 