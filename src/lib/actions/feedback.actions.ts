"use server";

import { nanoid } from "nanoid";
import db from "@/db/drizzle";
import { feedback } from "@/db/schema";

export async function submitFeedback(message: string) {
  try {
    if (!message?.trim()) {
      return {
        error: "Message is required",
      };
    }

    await db.insert(feedback).values({
      id: nanoid(),
      message,
      status: "new",
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return {
      error: "Failed to save feedback",
    };
  }
}
