import { auth } from '@/auth';
import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await request.text();
  const params = new URLSearchParams(data);
  
  try {
    const authResponse = pusher.authorizeChannel(
      params.get('socket_id')!,
      params.get('channel_name')!
    );
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher authorization error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 403 });
  }
}
