"use server";

import { nanoid } from "nanoid";
import db from "@/db/drizzle";
import { feedback, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function submitFeedback(message: string, name?: string, phoneNumber?: string) {
  if (!message?.trim()) {
    return {
      error: "Message is required",
    };
  }

  try {
    const session = await auth();
    let finalName = name;
    let finalPhoneNumber = phoneNumber;

    // If user is authenticated, get their details from the database
    if (session?.user?.id) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });
      
      if (user) {
        finalName = finalName || user.name;
        finalPhoneNumber = finalPhoneNumber || user.phoneNumber;
      }
    }

    await db.insert(feedback).values({
      id: nanoid(),
      message,
      name: finalName,
      phoneNumber: finalPhoneNumber,
      status: "new",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    return { error: "Failed to submit feedback" };
  }
}
