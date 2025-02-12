import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { eq, or, and, desc } from "drizzle-orm";
import { messages, matches, profiles } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all chats where the user has exchanged messages
    const activeChats = await db
      .select({
        matchId: matches.id,
        userId: profiles.userId,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profilePhoto: profiles.profilePhoto,
        lastMessage: messages.content,
        lastMessageAt: messages.createdAt,
        unreadCount: messages.id, // We'll count these in the code
      })
      .from(matches)
      .innerJoin(
        messages,
        eq(matches.id, messages.matchId)
      )
      .innerJoin(
        profiles,
        and(
          or(
            eq(matches.user1Id, profiles.userId),
            eq(matches.user2Id, profiles.userId)
          ),
          // Exclude the current user's profile
          eq(profiles.userId, session.user.id).not()
        )
      )
      .where(
        or(
          eq(matches.user1Id, session.user.id),
          eq(matches.user2Id, session.user.id)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group by match and count unread messages
    const groupedChats = activeChats.reduce((acc, chat) => {
      if (!acc[chat.matchId]) {
        acc[chat.matchId] = {
          ...chat,
          unreadCount: 0,
        };
      }
      return acc;
    }, {} as Record<string, typeof activeChats[0]>);

    return NextResponse.json(Object.values(groupedChats));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
} 