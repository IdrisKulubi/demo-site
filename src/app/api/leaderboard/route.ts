import { getWeeklyRankings, getDailyLeaders, getNewcomers } from "@/lib/actions/leaderboard.actions";
import { NextResponse } from "next/server";

export async function GET() {
  const [overall, daily, newcomers] = await Promise.all([
    getWeeklyRankings(),
    getDailyLeaders(),
    getNewcomers()
  ]);

  return NextResponse.json({
    overall,
    daily,
    newcomers
  });
} 