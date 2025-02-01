"use client";

import { motion } from "framer-motion";
import { Profile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useState } from "react";
import { GraduationCap, Instagram, Music, X, ArrowLeft, Heart } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  onRevert?: () => void;
  active: boolean;
  animate?: "left" | "right" | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants?: Record<string, any>;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isAnimating?: boolean;
  canRevert?: boolean;
}

export function SwipeCard({
  profile,
  onSwipe,
  onRevert,
  active,
  animate,
  variants,
  style,
  isAnimating,
  canRevert,
}: SwipeCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      className={cn(
        "absolute w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-xl",
        "bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black",
        active && "cursor-grab active:cursor-grabbing"
      )}
      animate={animate ? variants?.[animate] : undefined}
      style={{
        ...style,
        backgroundImage: 'none',
        touchAction: 'none',
      }}
      drag={active ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = offset.x * velocity.x;
        if (swipe < -20000) onSwipe("left");
        if (swipe > 20000) onSwipe("right");
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-full group"
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        >
          {[profile.profilePhoto, ...(profile.photos || [])].map((photo, index) => (
            <SwiperSlide key={index} className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
              <Image
                src={photo || ""}
                alt={`${profile.firstName}'s photo ${index + 1}`}
                className="w-full h-full object-cover"
                width={500}
                height={500}
              
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
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
                <Link
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {profile.spotify && (
                <Link
                  href={profile.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  <Music className="h-5 w-5" />
                </Link>
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

        {/* Controls overlay - show on both mobile and desktop */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-20">
          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full border-2 shadow-lg bg-white/90 hover:border-red-500 hover:bg-red-500/10"
            onClick={() => onSwipe("left")}
            disabled={isAnimating}
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>

          {canRevert && (
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full border-2 shadow-lg bg-white/90 hover:border-blue-500 hover:bg-blue-500/10"
              onClick={onRevert}
              disabled={isAnimating}
            >
              <ArrowLeft className="h-5 w-5 text-blue-500" />
            </Button>
          )}

          <Button
            size="icon"
            variant="outline"
            className="h-14 w-14 rounded-full border-2 shadow-lg bg-white/90 hover:border-pink-500 hover:bg-pink-500/10"
            onClick={() => onSwipe("right")}
            disabled={isAnimating}
          >
            <Heart className="h-6 w-6 text-pink-500" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
