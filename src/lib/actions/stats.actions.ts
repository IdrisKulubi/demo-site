"use server";

import db from "@/db/drizzle";
import { matches, users, swipes } from "@/db/schema";
import { sql } from "drizzle-orm";

export type StatsData = {
  matches: number;
  swipes: number;
  users: number;
};

export async function getAppStats(): Promise<StatsData> {
  try {
    // Get total matches count
    const [matchesCount] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(matches);

    // Get total swipes count
    const [swipesCount] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(swipes);

    // Get total users count
    const [usersCount] = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(users);

    return {
      matches: matchesCount?.count || 0,
      swipes: swipesCount?.count || 0,
      users: usersCount?.count || 0
    };
  } catch (error) {
    console.error("Error fetching app stats:", error);
    return {
      matches: 0,
      swipes: 0,
      users: 0
    };
  }
} 