import db from "@/db/drizzle";
import { Message, messages } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { User } from "next-auth";
import { pusher } from "./pusher/server";

export const updateMessageStatus = async (
  messageIds: string[],
  status: Message["status"],
  matchId: string,
  currentUser: User
) => {
  await db.update(messages)
    .set({ status })
    .where(inArray(messages.id, messageIds));
  
  if (status === "read") {
    await pusher.trigger(`match-${matchId}`, "messages-read", {
      messageIds,
      readerId: currentUser.id
    });
  }
}; 
