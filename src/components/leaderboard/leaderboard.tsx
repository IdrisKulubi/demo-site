"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Crown,
  Zap,
  Flame,
  Gem,
  Share2,
  Trophy,
  Star,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { RankChangeNotification } from "./rank-change-notification";
import { PersonalStats } from "./personal-stats";
import { ShareRankButton } from "./share-rank-button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Leaderboard({ initialData }: { initialData: any[] }) {
  const { data: session } = useSession();
  const { data = { overall: initialData, daily: [], newcomers: [] }, mutate } =
    useSWR("/api/leaderboard", fetcher, {
      refreshInterval: 10000,
      fallbackData: { overall: initialData, daily: [], newcomers: [] },
    });

  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>(
    {}
  );
  const [showRankChange, setShowRankChange] = useState(false);
  const [rankChangeData, setRankChangeData] = useState<{
    direction: "up" | "down";
    places: number;
  } | null>(null);

  // Move getTitle outside of render to prevent hydration mismatch
  const [userTitles, setUserTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      data.overall.forEach((entry: any) => {
        const previousRank = previousRanks[entry.userId];
        if (
          previousRank &&
          previousRank !== entry.rank &&
          entry.userId === session?.user?.id
        ) {
          setRankChangeData({
            direction: previousRank > entry.rank ? "up" : "down",
            places: Math.abs(previousRank - entry.rank),
          });
          setShowRankChange(true);
        }
      });
      setPreviousRanks(
        data.overall.reduce((acc: Record<string, number>, entry: any) => {
          acc[entry.userId] = entry.rank;
          return acc;
        }, {})
      );
    }
  }, [data]);

  useEffect(() => {
    // Generate titles once on mount for each user
    const titles: Record<string, string> = {};
    [...data.overall, ...data.daily, ...data.newcomers].forEach((entry) => {
      if (!titles[entry.userId]) {
        titles[entry.userId] = getRandomTitle(entry.score);
      }
    });
    setUserTitles(titles);
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Show PersonalStats at the top if user is logged in */}
      {session?.user?.id && (
        <div className="mb-8">
          <PersonalStats userId={session.user.id} />
        </div>
      )}

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">All Time 🏆</TabsTrigger>
          <TabsTrigger value="daily">Today's Hot 🔥</TabsTrigger>
          <TabsTrigger value="newcomers">Rising Stars ⭐</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4">
          <AnimatePresence initial={false}>
            {data.overall?.map((entry: any, index: number) => (
              <LeaderboardEntry
                key={entry.userId}
                entry={entry}
                index={index}
                title={userTitles[entry.userId]}
                isCurrentUser={entry.userId === session?.user?.id}
              />
            ))}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <AnimatePresence initial={false}>
            {data.daily?.map((entry: any, index: number) => (
              <LeaderboardEntry
                key={entry.userId}
                entry={entry}
                index={index}
                title={userTitles[entry.userId]}
                isCurrentUser={entry.userId === session?.user?.id}
              />
            ))}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="newcomers" className="space-y-4">
          <AnimatePresence initial={false}>
            {data.newcomers?.map((entry: any, index: number) => (
              <LeaderboardEntry
                key={entry.userId}
                entry={entry}
                index={index}
                title={userTitles[entry.userId]}
                isCurrentUser={entry.userId === session?.user?.id}
              />
            ))}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      <RankChangeNotification
        show={showRankChange}
        onHide={() => setShowRankChange(false)}
        data={rankChangeData}
      />
    </div>
  );
}

// Extract LeaderboardEntry to a separate component
function LeaderboardEntry({
  entry,
  index,
  title,
  isCurrentUser,
}: {
  entry: any;
  index: number;
  title: string;
  isCurrentUser: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "relative bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/90 dark:to-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all",
        index === 0 && "ring-2 ring-yellow-400 dark:ring-yellow-500",
        index === 1 && "ring-2 ring-gray-300 dark:ring-gray-400",
        index === 2 && "ring-2 ring-amber-600 dark:ring-amber-700",
        isCurrentUser && "border-2 border-pink-500/50"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left section - Profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={cn(
                "absolute inset-0 rounded-full animate-pulse",
                index === 0 && "bg-yellow-400/50",
                index === 1 && "bg-gray-300/50",
                index === 2 && "bg-amber-600/50"
              )}
            />
            <Image
              src={entry.image}
              alt={entry.name}
              className={cn(
                "w-16 h-16 rounded-full border-4",
                index === 0 && "border-yellow-400",
                index === 1 && "border-gray-300",
                index === 2 && "border-amber-600",
                "relative z-10"
              )}
              width={64}
              height={64}
            />
            <div className="absolute -top-2 -right-2 text-2xl z-20">
              {entry.badge}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{entry.name}</h3>
              {isCurrentUser && (
                <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-500">
                Level {Math.floor(entry.score / 100) + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Middle section - Stats */}
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-2xl">#{entry.rank}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rank</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-2xl">{entry.streak}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Streak</p>
          </div>
        </div>

        {/* Right section - Score & Share */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="font-bold text-3xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              {entry.score}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
          </div>
          {isCurrentUser && (
            <ShareRankButton rank={entry.rank} score={entry.score} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Move title generation to a separate constant
const TITLES = [
  "💘 Heartbreaker",
  "✨ Match Maker",
  "👑 Swipe Royalty",
  "🚀 Rising Star",
  "💎 Diamond Member",
  "🔥 Hot Streak",
  "🎯 Precision Pro",
  "💣 Profile Crusher",
] as const;

const getRandomTitle = (score: number) => {
  // Use a deterministic way to select title based on score
  return TITLES[score % TITLES.length];
};
