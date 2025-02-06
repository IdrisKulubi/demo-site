'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPersonalStats } from '@/lib/actions/leaderboard.actions';
import { Card } from '@/components/ui/card';

export function PersonalStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getPersonalStats(userId);
      setStats(data);
    };
    fetchStats();
  }, [userId]);

  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Your Stats This Week 📊
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Swipes"
          value={stats.totalSwipes}
          icon="🔄"
        />
        <StatCard
          title="Matches"
          value={stats.matches}
          icon="💘"
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          icon="🔥"
        />
        <StatCard
          title="Best Match %"
          value={`${stats.matchRate}%`}
          icon="✨"
        />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-xl font-bold text-pink-500">{value}</div>
    </Card>
  );
} 