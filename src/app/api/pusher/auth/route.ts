import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  const data = await req.text();
  const [socketId, channelName] = data
    .split("&")
    .map((part) => part.split("=")[1]);

  const auth = pusher.authenticate(socketId, channelName);
  return NextResponse.json(auth);
}
