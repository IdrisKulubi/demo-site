"use client";

import { motion } from "framer-motion";

export function NotifyModal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-24 right-4 w-72 p-4 rounded-2xl bg-pink-50/80 dark:bg-pink-950/80 backdrop-blur-sm border border-pink-200 dark:border-pink-800 shadow-lg z-50 hidden md:block lg:block"
    >
      <div className="text-center space-y-3">
        <div className="text-3xl animate-bounce">💌</div>
        <div>
          <p className="text-sm font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
             chat feature otw 👨‍💻, It&apos;s cooking 🔥
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            gonna be bussin fr fr ✨
          </p>
        </div>
      </div>
    </motion.div>
  );
}
