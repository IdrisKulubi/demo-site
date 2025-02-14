"use server";

import db from "@/db/drizzle";
import { messages } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { pusher } from "@/lib/pusher/server";

export async function getChats() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Get all matches and their profiles, with optional message counts
    const result = await db.execute(sql`
      SELECT 
        m.id::text as "matchId",
        CASE 
          WHEN m.user1_id = ${session.user.id}::uuid THEN m.user2_id 
          ELSE m.user1_id 
        END as "userId",
        p.first_name as "firstName",
        p.last_name as "lastName",
        p.profile_photo as "profilePhoto",
        p.course as "course",
        p.year_of_study as "yearOfStudy",
        (
          SELECT content 
          FROM message 
          WHERE match_id = m.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as "lastMessage",
        (
          SELECT created_at 
          FROM message 
          WHERE match_id = m.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ) as "lastMessageTime",
        (
          SELECT COUNT(*) 
          FROM message 
          WHERE match_id = m.id 
          AND is_read = false 
          AND sender_id != ${session.user.id}::uuid
        ) as "unreadCount",
        m.created_at as "matchedAt"
      FROM matches m
      INNER JOIN profiles p ON p.user_id = (
        CASE 
          WHEN m.user1_id = ${session.user.id}::uuid THEN m.user2_id
          ELSE m.user1_id 
        END
      )
      WHERE m.user1_id = ${session.user.id}::uuid
         OR m.user2_id = ${session.user.id}::uuid
      ORDER BY 
        COALESCE((
          SELECT created_at 
          FROM message 
          WHERE match_id = m.id 
          ORDER BY created_at DESC 
          LIMIT 1
        ), m.created_at) DESC
    `);

    const chats = result.rows.map(chat => ({
      matchId: chat.matchId,
      userId: chat.userId,
      firstName: chat.firstName,
      lastName: chat.lastName,
      profilePhoto: chat.profilePhoto,
      course: chat.course || '',
      yearOfStudy: chat.yearOfStudy || 0,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime,
      unreadCount: Number(chat.unreadCount) || 0,
      matchedAt: chat.matchedAt
    }));

    return { chats };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { error: "Failed to fetch chats" };
  }
}

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