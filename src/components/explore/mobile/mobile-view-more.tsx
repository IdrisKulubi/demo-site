"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Heart, Music } from "lucide-react";
import type { Profile } from "@/db/schema";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { FaInstagram } from "react-icons/fa";

interface MobileViewMoreProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onLike?: () => void;
}

export function MobileViewMore({
  profile,
  isOpen,
  onClose,
  onLike,
}: MobileViewMoreProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[92vh] p-0">
        <ScrollArea className="h-full">
          {/* Photos Carousel */}
          <div className="relative h-[40vh] bg-gray-100 dark:bg-gray-800">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="h-full w-full"
            >
              <SwiperSlide>
                <Image
                  src={profile.profilePhoto || ""}
                  alt={profile.firstName}
                  fill
                  className="object-cover"
                  priority
                />
              </SwiperSlide>
              {profile.photos?.map((photo, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={photo}
                    alt={`${profile.firstName}'s photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold">
                {profile.firstName}, {profile.age}
              </h2>
              <p className="text-muted-foreground">
                {profile.course} • Year {profile.yearOfStudy}
              </p>
            </motion.div>

            {/* Bio */}
            {profile.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-semibold">About</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
              </motion.div>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-500"
                >
                  <FaInstagram className="h-5 w-5" />
                  <span className="text-sm">@{profile.instagram}</span>
                </a>
              )}
              {profile.spotify && (
                <a
                  href={profile.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-pink-500"
                >
                  <Music className="h-5 w-5" />
                  <span className="text-sm">Spotify</span>
                </a>
              )}
            </motion.div>

            {/* Like Button */}
            {onLike && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="sticky bottom-0 bg-white/80 dark:bg-background/80 backdrop-blur-sm p-4 -mx-6 -mb-4 border-t border-pink-100 dark:border-pink-900"
              >
                <Button
                  onClick={onLike}
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Like {profile.firstName}
                </Button>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
