"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { animated, to } from "@react-spring/web";

const SWIPE_THRESHOLD = 100;

export function SwipeCard({ 
  profile, 
  onSwipe,
  style,
  active,
  ...props 
}: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Convert spring values to CSS transform
  const transform = to(
    [style?.x, style?.y, style?.rot, style?.scale],
    (x, y, rot, scale) => 
      `translate3d(${x}px,${y}px,0) rotate(${rot}deg) scale(${scale})`
  );

  return (
    <animated.div
      className={cn(
        "absolute w-full aspect-[3/4] rounded-3xl overflow-hidden will-change-transform",
        "touch-none select-none",
        active && "cursor-grab active:cursor-grabbing"
      )}
      style={{
        transform,
        zIndex: active ? 5 : 0,
        touchAction: "none",
      }}
      {...props}
    >
      <motion.div
        className="relative w-full h-full bg-background rounded-3xl shadow-xl overflow-hidden"
        style={{
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Card Content */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={profile.profilePhoto}
            alt={`${profile.firstName}'s profile`}
            width={500}
            height={667}
            className="w-full h-full object-cover"
            priority={active}
          />
          
          {/* Swipe Indicators */}
          <AnimatePresence>
            {isDragging && (style?.x || 0) > SWIPE_THRESHOLD && (
              <motion.div
                className="absolute top-8 right-8 text-green-500 text-6xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                ❤️
              </motion.div>
            )}
            {isDragging && (style?.x || 0) < -SWIPE_THRESHOLD && (
              <motion.div
                className="absolute top-8 left-8 text-red-500 text-6xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.8 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                ✕
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Info */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-bold text-white">
              {profile.firstName}, {profile.age}
            </h3>
            <p className="text-gray-200 line-clamp-2">{profile.bio}</p>
          </motion.div>
        </div>
      </motion.div>
    </animated.div>
  );
} 