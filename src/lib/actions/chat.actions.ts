"use server";

import db from "@/db/drizzle";
import { matches, profiles, messages } from "@/db/schema";
import { desc, eq, and, or, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { pusher } from "@/lib/pusher/server";

export type ChatItem = {
  matchId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  course: string;
  yearOfStudy: number;
  lastMessage?: string | null;
  lastMessageTime?: Date | null;
  unreadCount: number;
  matchedAt: Date;
};

export async function sendMessage(matchId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const newMessage = await db
      .insert(messages)
      .values({
        matchId,
        senderId: session.user.id,
        content,
        createdAt: new Date(),
      })
      .returning();

    if (newMessage[0]) {
      await pusher.trigger(
        `private-match-${matchId}`,
        "new-message",
        newMessage[0]
      );
      return { message: newMessage[0] };
    }

    throw new Error("Failed to create message");
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

export async function getMessages(matchId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.matchId, matchId),
      orderBy: [desc(messages.createdAt)],
      limit: 50,
    });

    return { messages: chatMessages.reverse() };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { error: "Failed to fetch messages" };
  }
}

export async function getChats() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;

    const chats = await db
      .select({
        matchId: matches.id,
        userId: sql<string>`CASE 
          WHEN ${matches.user1Id}::text = ${userId} THEN ${matches.user2Id}::text
          ELSE ${matches.user1Id}::text
        END`.as("userId"),
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profilePhoto: profiles.profilePhoto,
        course: profiles.course,
        yearOfStudy: profiles.yearOfStudy,
        matchedAt: matches.createdAt,
        unreadCount: sql<number>`(
          SELECT COUNT(*) 
          FROM ${messages} 
          WHERE ${messages.matchId} = ${matches.id}
          AND ${messages.senderId}::text != ${userId}
          AND ${messages.isRead} = false
        )`
      })
      .from(matches)
      .innerJoin(
        profiles,
        or(
          and(
            eq(matches.user1Id, sql`${userId}::uuid`),
            eq(profiles.userId, matches.user2Id)
          ),
          and(
            eq(matches.user2Id, sql`${userId}::uuid`),
            eq(profiles.userId, matches.user1Id)
          )
        )
      )
      .where(
        or(
          eq(matches.user1Id, sql`${userId}::uuid`),
          eq(matches.user2Id, sql`${userId}::uuid`)
        )
      )
      .orderBy(desc(matches.createdAt));

    return {
      chats: chats.map(chat => ({
        ...chat,
        course: chat.course || '',
        yearOfStudy: chat.yearOfStudy || 0,
        unreadCount: Number(chat.unreadCount) || 0
      }))
    };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { error: "Failed to fetch chats" };
  }
} 