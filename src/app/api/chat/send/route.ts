import { NextResponse } from "next/server";
import { messages } from "@/db/schema";
import { pusher } from "@/lib/pusher/server";
import db from "@/db/drizzle";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { matchId, content } = await req.json();
    
    if (!matchId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    // Ensure we have a message before triggering Pusher
    if (newMessage[0]) {
      // Trigger real-time update for both users in the match
      await pusher.trigger(
        `private-match-${matchId}`,
        "new-message",
        newMessage[0]
      );

      return NextResponse.json(newMessage[0]);
    }

    throw new Error("Failed to create message");
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
