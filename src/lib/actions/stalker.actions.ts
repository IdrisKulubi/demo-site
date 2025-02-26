"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { profileViews } from "@/db/schema";
import { eq,  desc, sql } from "drizzle-orm";

export async function trackProfileView(viewedUserId: string) {
  const session = await auth();
  if (!session?.user || session.user.id === viewedUserId) return;

  await db.insert(profileViews)
    .values({
      viewerId: session.user.id,
      viewedId: viewedUserId
    })
    .onConflictDoNothing();
}

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