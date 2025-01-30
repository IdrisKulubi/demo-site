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
      className="fixed top-16 md:bottom-6 md:top-auto left-1/2 md:left-auto md:right-6 -translate-x-1/2 md:translate-x-0 bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-lg rounded-full px-2 md:px-4 py-0.5 md:py-1.5 shadow-lg border border-pink-200 dark:border-pink-800 z-40 hover:scale-105 transition-transform"
    >
      <div className="flex flex-col md:flex-row items-center gap-0 md:gap-2">
        <div className="flex items-center gap-1 md:gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <Heart className="h-3 w-3 md:h-5 md:w-5 text-white" fill="white" />
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
            <motion.div className="flex flex-col md:flex-row items-center gap-0 md:gap-1">
              <motion.span
                key={formattedCount}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="font-bold text-white text-xs md:text-base min-w-[1rem] md:min-w-[1.5rem] text-center leading-none"
              >
                {formattedCount}
              </motion.span>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                className="text-[8px] md:text-sm text-white/90 md:inline leading-tight"
              >
               total swipes
              </motion.span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
