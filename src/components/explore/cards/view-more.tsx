"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import type { Profile } from "@/db/schema";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface ViewMoreModalProps {
  profile?: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewMoreModal({
  profile,
  isOpen,
  onClose,
}: ViewMoreModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!profile) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white/80 dark:bg-background/80 backdrop-blur-xl">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Get to know {profile.firstName} better ✨
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Photos Carousel */}
          <div
            className={cn(
              "rounded-lg overflow-hidden",
              isMobile ? "aspect-[4/3]" : "aspect-[16/9]"
            )}
          >
            {profile.photos && profile.photos.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination, EffectFade]}
                effect="fade"
                navigation
                pagination={{ clickable: true }}
                className="h-full w-full"
              >
                {profile.photos.map((photo, index) => (
                  <SwiperSlide key={`${profile.userId}-${photo}-${index}`}>
                    <Image
                      src={photo}
                      alt={`${profile.firstName}'s photo ${index + 1}`}
                      className="h-full w-full object-cover"
                      width={600}
                      height={400}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">No photos available</p>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div
            className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {profile.firstName} {profile.lastName}{" "}
                  <span className="text-base">
                    {profile.gender === "male" && "👨"}
                    {profile.gender === "female" && "👩"}
                    {profile.gender === "non-binary" && "🌈"}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {profile.course} • Year {profile.yearOfStudy}
                </p>
              </div>

              {profile.bio && (
                <div className="bg-pink-50/50 dark:bg-pink-950/50 p-3 rounded-lg">
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              <div className="flex gap-3">
                <WhatsAppButton
                  phoneNumber={profile.phoneNumber || ""}
                  size={isMobile ? "default" : "sm"}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                />
              </div>
            </div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Interests/Hobbies */}
              {profile.interests && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 rounded-full text-xs bg-pink-100/50 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Social Media
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.instagram && (
                    <a
                      href={profile.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-100/50 to-purple-100/50 dark:from-pink-900/50 dark:to-purple-900/50 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-base">📸</span>
                      <span className="text-xs">Instagram</span>
                    </a>
                  )}
                  {profile.spotify && (
                    <a
                      href={profile.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-100/50 to-purple-100/50 dark:from-pink-900/50 dark:to-purple-900/50 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-base">🎵</span>
                      <span className="text-xs">Spotify</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
