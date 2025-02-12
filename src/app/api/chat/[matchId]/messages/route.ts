import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import db from '@/db/drizzle';
import { eq, desc } from "drizzle-orm";
import { messages } from "@/db/schema";

export async function GET(
  req: Request,
  { params }: { params: { matchId: string } }
) {
  // Await params to get matchId
  const matchId = await Promise.resolve(params.matchId);
  
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.matchId, matchId),
      orderBy: [desc(messages.createdAt)],
      limit: 50,
    });

    return NextResponse.json({ messages: chatMessages.reverse() });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
} 