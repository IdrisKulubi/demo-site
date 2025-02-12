import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { matches, profiles } from "@/db/schema";
import { desc, eq, and, or, sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cast session.user.id to text for comparison with user1Id/user2Id
    const userId = sql.raw(`'${session.user.id}'::text`);

    const userChats = await db
      .select({
        matchId: matches.id,
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profilePhoto: profiles.profilePhoto,
        course: profiles.course,
        yearOfStudy: profiles.yearOfStudy,
        lastMessage: sql`(
          SELECT content 
          FROM "message" 
          WHERE match_id::text = matches.id::text
          ORDER BY created_at DESC 
          LIMIT 1
        )`.mapWith(String),
        lastMessageTime: sql`(
          SELECT created_at 
          FROM "message" 
          WHERE match_id::text = matches.id::text
          ORDER BY created_at DESC 
          LIMIT 1
        )`.mapWith(Date),
        unreadCount: sql`(
          SELECT COUNT(*) 
          FROM "message" 
          WHERE match_id::text = matches.id::text
          AND sender_id != ${userId}
          AND is_read = false
        )`.mapWith(Number),
      })
      .from(matches)
      .innerJoin(
        profiles,
        and(
          or(
            and(
              eq(sql`${matches.user1Id}::text`, session.user.id),
              eq(sql`${profiles.userId}::text`, sql`${matches.user2Id}::text`)
            ),
            and(
              eq(sql`${matches.user2Id}::text`, session.user.id),
              eq(sql`${profiles.userId}::text`, sql`${matches.user1Id}::text`)
            )
          )
        )
      )
      .where(
        and(
          or(
            eq(sql`${matches.user1Id}::text`, session.user.id),
            eq(sql`${matches.user2Id}::text`, session.user.id)
          ),
          sql`EXISTS (
            SELECT 1 
            FROM "message" 
            WHERE match_id::text = matches.id::text
          )`
        )
      )
      .orderBy(desc(matches.createdAt));

    // Ensure we always return an array
    const formattedChats = Array.isArray(userChats) ? userChats : [];

    return NextResponse.json({
      chats: formattedChats.map(chat => ({
        ...chat,
        lastMessage: chat.lastMessage || null,
        lastMessageTime: chat.lastMessageTime || null,
        unreadCount: Number(chat.unreadCount) || 0,
      })),
    });
    
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 