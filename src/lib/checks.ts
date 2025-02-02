"use server";

import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";
import db from "@/db/drizzle";

export async function checkProfileCompletion() {
  const session = await auth();
  if (!session?.user) return { hasProfile: false };

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.userId, session.user.id),
      columns: { id: true },
    });

    return { hasProfile: !!profile };
  } catch (error) {
    console.error("Profile check failed:", error);
    return { hasProfile: false };
  }
}

export type ProfileCheckResult = Awaited<
  ReturnType<typeof checkProfileCompletion>
>;
