'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AchievementPopup() {
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    const sse = new EventSource('/api/achievements/sse');
    
    sse.onmessage = (e) => {
      setAchievements(prev => [...prev, e.data]);
      setTimeout(() => {
        setAchievements(prev => prev.slice(1));
      }, 3000);
    };

    return () => sse.close();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      <AnimatePresence>
        {achievements.map((text, index) => (
          <motion.div
            key={index}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3"
          >
            <div className="text-2xl">🎉</div>
            <div>
              <p className="font-bold">Achievement Unlocked!</p>
              <p>{text}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 