"use client";

import { motion } from "framer-motion";

export function NotifyMobile() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full px-4 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-500/5 dark:to-purple-500/5 border-b border-pink-100 dark:border-pink-900 backdrop-blur-sm"
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm animate-bounce">💌</span>
        <p className="text-xs font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          chat feature otw 👨‍💻, It&apos;s cooking 🔥
        </p>
       
      </div>
    </motion.div>
  );
}
