'use server';

import db from "@/db/drizzle";
import { achievements } from "@/db/schema";

export const unlockAchievement = async (userId: string, type: string) => {
  return db.insert(achievements)
    .values({
      userId,
      type,
      unlockedAt: new Date()
    })
    .onConflictDoNothing();
};

export const getRecentAchievements = async (userId: string) => {
  return db.query.achievements.findMany({
    where: (achievements, { eq }) => eq(achievements.userId, userId),
    orderBy: (achievements, { desc }) => [desc(achievements.unlockedAt)],
    limit: 5
  });
}; 