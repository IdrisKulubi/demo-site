"use server";

import db from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { profiles, swipes } from "@/db/schema";

type LeaderboardEntry = {
  userId: string;
  rank: number;
  name: string;
  image: string;
  score: number;
  streak: number;
  badge: "👑" | "💎" | "🚀" | "🔥";
};

export const getWeeklyRankings = async (): Promise<LeaderboardEntry[]> => {
  const result = await db.execute(sql`
    WITH swipe_stats AS (
      SELECT 
        swiper_id,
        COUNT(*) FILTER (WHERE is_like = true) AS likes,
        COUNT(*) FILTER (WHERE is_like = false) AS passes,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') AS daily_swipes,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/86400 AS swipe_streak
      FROM ${swipes}
      GROUP BY swiper_id
    )
    SELECT
      p.user_id,
      RANK() OVER (ORDER BY (s.likes * 2 - s.passes) DESC) as rank,
      CONCAT(p.first_name, ' ', LEFT(p.last_name, 1), '.') as name,
      p.profile_photo as image,
      (s.likes * 2 - s.passes) as score,
      COALESCE(FLOOR(s.swipe_streak)::integer, 0) as streak,
      CASE
        WHEN s.daily_swipes >= 50 THEN '👑'
        WHEN s.likes >= 100 THEN '💎'
        WHEN s.swipe_streak >= 7 THEN '🚀'
        ELSE '🔥'
      END as badge
    FROM ${profiles} p
    JOIN swipe_stats s ON p.user_id = s.swiper_id
    ORDER BY score DESC
    LIMIT 100
  `);

  return result.rows.map((row: any) => ({
    userId: row.user_id,
    rank: Number(row.rank),
    name: row.name,
    image: row.image,
    score: Number(row.score),
    streak: Number(row.streak),
    badge: row.badge as "👑" | "💎" | "🚀" | "🔥",
  }));
};

export const getPersonalStats = async (userId: string): Promise<any> => {
  const result = await db.execute(sql`
    WITH user_stats AS (
      SELECT
        COUNT(*) as total_swipes,
        COUNT(*) FILTER (WHERE is_match = true) as matches,
        ROUND(COUNT(*) FILTER (WHERE is_match = true)::float / 
          NULLIF(COUNT(*), 0) * 100, 1) as match_rate,
        MAX(current_streak) as current_streak
      FROM ${swipes}
      WHERE swiper_id = ${userId}
      AND created_at > NOW() - INTERVAL '7 days'
    )
    SELECT
      total_swipes,
      matches,
      match_rate,
      COALESCE(current_streak, 0) as current_streak
    FROM user_stats
  `);

  return result.rows[0];
};

export const getDailyLeaders = async (): Promise<LeaderboardEntry[]> => {
  const result = await db.execute(sql`
    WITH daily_stats AS (
      SELECT 
        swiper_id,
        COUNT(*) FILTER (WHERE is_like = true) AS likes,
        COUNT(*) FILTER (WHERE is_like = false) AS passes,
        COUNT(*) AS total_swipes,
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at)))/86400 AS swipe_streak
      FROM ${swipes}
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY swiper_id
    )
    SELECT
      p.user_id,
      RANK() OVER (ORDER BY d.total_swipes DESC) as rank,
      CONCAT(p.first_name, ' ', LEFT(p.last_name, 1), '.') as name,
      p.profile_photo as image,
      d.total_swipes as score,
      COALESCE(FLOOR(d.swipe_streak)::integer, 0) as streak,
      CASE
        WHEN d.total_swipes >= 50 THEN '👑'
        WHEN d.likes >= 20 THEN '💎'
        WHEN d.swipe_streak >= 1 THEN '🚀'
        ELSE '🔥'
      END as badge
    FROM ${profiles} p
    JOIN daily_stats d ON p.user_id = d.swiper_id
    ORDER BY score DESC
    LIMIT 100
  `);

  return result.rows.map((row: any) => ({
    userId: row.user_id,
    rank: Number(row.rank),
    name: row.name,
    image: row.image,
    score: Number(row.score),
    streak: Number(row.streak),
    badge: row.badge as "👑" | "💎" | "🚀" | "🔥",
  }));
};

export const getNewcomers = async (): Promise<LeaderboardEntry[]> => {
  const result = await db.execute(sql`
    WITH newcomer_stats AS (
      SELECT 
        swiper_id,
        COUNT(*) FILTER (WHERE is_like = true) AS likes,
        COUNT(*) AS total_swipes,
        MAX(created_at) - MIN(created_at) AS active_time
      FROM ${swipes}
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY swiper_id
    )
    SELECT
      p.user_id,
      RANK() OVER (ORDER BY (s.likes * 2) DESC) as rank,
      CONCAT(p.first_name, ' ', LEFT(p.last_name, 1), '.') as name,
      p.profile_photo as image,
      (s.likes * 2) as score,
      EXTRACT(DAY FROM s.active_time)::integer as streak,
      CASE
        WHEN s.total_swipes >= 50 THEN '👑'
        WHEN s.likes >= 20 THEN '💎'
        WHEN EXTRACT(DAY FROM s.active_time) >= 3 THEN '🚀'
        ELSE '🔥'
      END as badge
    FROM ${profiles} p
    JOIN newcomer_stats s ON p.user_id = s.swiper_id
    WHERE p.created_at > NOW() - INTERVAL '14 days'
    ORDER BY score DESC
    LIMIT 30
  `);

  return result.rows.map((row: any) => ({
    userId: row.user_id,
    rank: Number(row.rank),
    name: row.name,
    image: row.image,
    score: Number(row.score),
    streak: Number(row.streak),
    badge: row.badge as "👑" | "💎" | "🚀" | "🔥",
  }));
};

// Add index for optimization
await sql`CREATE INDEX IF NOT EXISTS swipes_swiper_type_idx ON ${swipes} (swiper_id, type)`;
