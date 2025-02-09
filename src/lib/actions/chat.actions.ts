"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const sendMessage = async (matchId: string, text: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!matchId) throw new Error("Match ID is required");

  try {
    const [message] = await db
      .insert(messages)
      .values({
        matchId: matchId,
        senderId: session.user.id,
        content: text,
        createdAt: new Date(),
        type: "text",
        isRead: false,
      })
      .returning();

    // Trigger Pusher event
    await pusher.trigger(`private-match-${matchId}`, "new-message", message);

    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
};

export const getMessageHistory = async (matchId: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.query.messages.findMany({
    where: eq(messages.matchId, matchId),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    limit: 50,
  });
};

export const sendTypingStatus = async (matchId: string, isTyping: boolean) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await pusher.trigger(`private-match-${matchId}`, "typing", {
      userId: session.user.id,
      isTyping,
    });
  } catch (error) {
    console.error("Error sending typing status:", error);
  }
};
