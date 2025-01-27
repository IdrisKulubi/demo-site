"use client";

import { motion } from "framer-motion";
import { Profile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useState } from "react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  active: boolean;
  animate?: "left" | "right" | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants?: Record<string, any>;
}

export function SwipeCard({
  profile,
  onSwipe,
  active,
  animate,
  variants,
}: SwipeCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onSwipe("left");
    } else if (isRightSwipe) {
      onSwipe("right");
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <motion.div
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipe(info.offset.x > 0 ? "right" : "left");
        }
      }}
      animate={animate ? variants?.[animate] : ""}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "absolute h-full w-full bg-white dark:bg-background rounded-3xl shadow-xl overflow-hidden",
        active ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      )}
    >
      <div className="relative h-full">
        {/* Profile Photos with Swiper */}
        <div className="relative h-3/4">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="h-full w-full"
          >
            {profile.photos?.map((photo, index) => (
              <SwiperSlide key={`${photo}-${index}-${profile.userId}`}>
                <motion.img
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full object-cover"
                  src={photo}
                  alt={`Profile ${index + 1}`}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Profile Info */}
        <div className="absolute border-sm bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-4 border-sm">
            <h2 className=" text-xl sm:text-3xl font-bold">
              {profile.firstName} {profile.lastName?.charAt(0)}. {profile.age}
            </h2>
            <span className="text-xl sm:text-2xl">
              {profile.gender === "male" && "👨"}
              {profile.gender === "female" && "👩"}
              {profile.gender === "non-binary" && "🌈"}
            </span>
          </div>
          <p className="text-base sm:text-sm line-clamp-2 mt-1 sm:mt-2">
            {profile.bio}
          </p>

          {/* Social Links */}
          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-4 opacity-75">
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-xl sm:text-2xl">📸</span>
              </a>
            )}
            {profile.spotify && (
              <a
                href={profile.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-xl sm:text-2xl">🎵</span>
              </a>
            )}
          </div>
        </div>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute inset-0 border-8 opacity-0"
          animate={{
            opacity: active ? 1 : 0,
            borderColor: ["#ff69b4", "#ff85c8", "#ff69b4"],
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </div>
    </motion.div>
  );
}
