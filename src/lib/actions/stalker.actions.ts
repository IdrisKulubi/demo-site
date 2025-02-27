"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { profileViews } from "@/db/schema";
import { eq,  desc, sql } from "drizzle-orm";
import { safeAction } from "@/lib/safe-action";
import { z } from "zod";

export const trackProfileView = safeAction(
  z.string(),
  async (viewedUserId: string) => {
    try {
      const session = await auth();
      if (!session?.user || session.user.id === viewedUserId) return { success: true } as const;

      await db.insert(profileViews)
        .values({
          viewerId: session.user.id,
          viewedId: viewedUserId
        })
        .onConflictDoNothing();
      return { success: true } as const;
    } catch (error) {
      console.error("Error tracking profile view:", error);
      return { success: false, error: "Failed to track profile view" } as const;
    }
  },
);

export async function getStalkers() {
  const session = await auth();
  if (!session?.user) return [];
  
  return db.query.profileViews.findMany({
    where: eq(profileViews.viewedId, session.user.id),
    with: {
      viewer: {
        columns: { id: true, name: true, image: true },
        with: { profile: true }
      }
    },
    orderBy: [desc(profileViews.viewedAt)]
  });
}

export async function getStalkerCount() {
  const session = await auth();
  if (!session?.user) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(profileViews)
    .where(eq(profileViews.viewedId, session.user.id));
    
  return result[0]?.count || 0;
} 