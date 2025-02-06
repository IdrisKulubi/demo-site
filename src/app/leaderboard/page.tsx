import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { getWeeklyRankings } from "@/lib/actions/leaderboard.actions";

export const revalidate = 60; // Revalidate every minute

export default async function LeaderboardPage() {
  const rankings = await getWeeklyRankings();
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-5xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        🔥 Lit Leaderboard
      </h1>
      <Leaderboard initialData={rankings} />
    </div>
  );
} 