import { NextResponse } from "next/server";
import  db  from "@/db/drizzle";
import { messages } from "@/db/schema";
import { pusher } from "@/lib/pusher/server";

export async function POST(req: Request) {
  const { matchId, senderId, content } = await req.json();

  const newMessage = await db
    .insert(messages)
    .values({
      matchId,
      senderId,
      content,
      createdAt: new Date(),
    })
    .returning();

  await pusher.trigger(
    `private-match-${matchId}`,
    "new-message",
    newMessage[0]
  );

  return NextResponse.json(newMessage[0]);
}
