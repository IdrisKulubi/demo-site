"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface RankChangeNotificationProps {
  show: boolean;
  onHide: () => void;
  data: {
    direction: "up" | "down";
    places: number;
  } | null;
}

export function RankChangeNotification({
  show,
  onHide,
  data,
}: RankChangeNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {show && data && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full shadow-lg
              ${
                data.direction === "up"
                  ? "bg-green-500 text-white"
                  : "bg-pink-500 text-white"
              }
            `}
          >
            {data.direction === "up" ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="font-medium">
              {data.direction === "up" ? "Moved up" : "Moved down"}{" "}
              {data.places} {data.places === 1 ? "place" : "places"}!{" "}
              {data.direction === "up" ? "🚀" : "💪"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 