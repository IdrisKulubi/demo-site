'use server'

import  db  from "@/db/drizzle";
import { messages } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function getChatMessages(matchId: string) {
  const response = await fetch(`/api/chat/${matchId}`);
  const data = await response.json();
  return {
    messages: data.messages,
    partner: data.partner
  };
}

export async function sendMessage(matchId: string, content: string, senderId: string) {
  const message = await db.insert(messages)
    .values({
      id: uuidv4(),
      matchId,
      content,
      senderId,
      status: "sent",
    })
    .returning();
    
  return { message: message[0] };
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