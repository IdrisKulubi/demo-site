"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSwipeCounter } from "@/context/swipe-counter-context";
import { Heart } from "lucide-react";
import { useTheme } from "next-themes";

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function SwipeCounter() {
  const { swipeCount } = useSwipeCounter();
  const { theme } = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDark = theme === "dark";
  const formattedCount = formatNumber(swipeCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg border border-pink-200 dark:border-pink-800 z-50 hover:scale-105 transition-transform"
    >
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <Heart className="h-5 w-5 text-white" fill="white" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              repeatType: "loop",
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-white/30"
          />
        </motion.div>
        <AnimatePresence mode="popLayout">
          <motion.div className="flex items-center gap-1">
            <motion.span
              key={formattedCount}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="font-bold text-white min-w-[2rem] text-center"
            >
              {formattedCount}
            </motion.span>
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              className="text-sm text-white/90"
            >
              total swipes
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
