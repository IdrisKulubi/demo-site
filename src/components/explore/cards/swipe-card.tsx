"use client";

import { motion } from "framer-motion";
import { Profile } from "@/db/schema";

import { cn } from "@/lib/utils";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  active: boolean;
}

export function SwipeCard({ profile, onSwipe, active }: SwipeCardProps) {
  return (
    <motion.div
      drag={active}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 100) {
          onSwipe(info.offset.x > 0 ? "right" : "left");
        }
      }}
      className={cn(
        "absolute h-[70vh] w-full max-w-md bg-white dark:bg-background rounded-3xl shadow-xl overflow-hidden",
        active ? "cursor-grab active:cursor-grabbing" : "cursor-auto"
      )}
    >
      <div className="relative h-full">
        {/* Profile Photos */}
        <div className="relative h-3/4 overflow-hidden">
          {profile.photos?.map((photo, index) => (
            <motion.img
              key={photo}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: index === 0 ? 1 : 0 }}
              className="absolute inset-0 w-full h-full object-cover"
              src={photo}
              alt={`Profile ${index + 1}`}
            />
          ))}
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">
              {profile.firstName} {profile.lastName?.charAt(0)}. {profile.age}
            </h2>
            {profile.gender === "male" && "👨"}
            {profile.gender === "female" && "👩"}
            {profile.gender === "non-binary" && "🌈"}
          </div>
          <p className="text-lg line-clamp-2">{profile.bio}</p>

          {/* Social Links */}
          <div className="flex gap-3 mt-4 opacity-75">
            {profile.instagram && (
              <a
                href={`https://instagram.com/${profile.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-2xl">📸</span>
              </a>
            )}
            {profile.spotify && (
              <a
                href={profile.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="text-2xl">🎵</span>
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
