import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Pusher from "pusher";
import db from "@/db/drizzle";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  const session = await auth();
  const data = await req.text();
  const [socketId, channelName] = data
    .split("&")
    .map((part) => part.split("=")[1]);

  // Verify user is part of the match
  if (channelName.startsWith("match-")) {
    const matchId = channelName.split("-")[1];
    const isMember = await verifyMatchMembership(matchId, session?.user.id);
    
    if (!isMember) {
      return NextResponse.json(
        { error: "Unauthorized channel access" },
        { status: 403 }
      );
    }
  }

  const authResponse = pusher.authenticate(socketId, channelName, {
    user_id: session?.user.id ?? "",
  });
  
  return NextResponse.json(authResponse);
}

async function verifyMatchMembership(matchId: string, userId?: string) {
  if (!userId) return false;
  
  const match = await db.query.matches.findFirst({
    where: (matches, { eq }) => 
      eq(matches.id, matchId) &&
      (eq(matches.user1Id, userId) || eq(matches.user2Id, userId))
  });
  
  return !!match;
}
