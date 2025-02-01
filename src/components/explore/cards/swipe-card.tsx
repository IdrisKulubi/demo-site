"use client";

import { motion } from "framer-motion";
import { Profile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useState } from "react";
import { GraduationCap, MapPin, Instagram, Music } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  active: boolean;
  animate?: "left" | "right" | null;
  variants?: Record<string, any>;
  style?: React.CSSProperties;
}

export function SwipeCard({
  profile,
  onSwipe,
  active,
  animate,
  variants,
  style,
}: SwipeCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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

    if (isLeftSwipe) onSwipe("left");
    else if (isRightSwipe) onSwipe("right");

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
      style={style}
    >
      <div className="relative h-full">
        {/* Photos Swiper */}
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="h-full w-full"
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        >
          {profile.photos?.map((photo, index) => (
            <SwiperSlide 
              key={`${photo}-${index}`} 
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 z-10" />
              <motion.img
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full object-cover"
                src={photo}
                alt={`${profile.firstName}'s photo ${index + 1}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
          <div className="space-y-2">
            {/* Name, Age & Verification */}
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile.firstName}, {profile.age}
              </h2>
              <span className="text-blue-400">✓</span>
            </div>

            {/* Education & Course */}
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4" />
              <span>{profile.course}, Year {profile.yearOfStudy}</span>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm line-clamp-2 opacity-90">
                {profile.bio}
              </p>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/20 text-xs backdrop-blur-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {profile.spotify && (
                <a
                  href={profile.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  <Music className="h-5 w-5" />
                </a>
              )}
            </div>
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
