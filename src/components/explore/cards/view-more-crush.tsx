"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectFade } from "swiper/modules";
import { Heart } from "lucide-react";
import type { Profile } from "@/db/schema";
import Image from "next/image";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FaInstagram, FaSpotify } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ViewMoreCrushProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onLikeBack: (profileId: string) => void;
}

export function ViewMoreCrush({
  profile,
  isOpen,
  onClose,
  onLikeBack,
}: ViewMoreCrushProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-lg p-0 overflow-hidden bg-white/90 dark:bg-background/90 backdrop-blur-xl h-[90vh] border border-gray-300 rounded-lg shadow-lg">
        {/* Carousel Section */}
        <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-t-lg overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, EffectFade]}
            navigation={!isMobile}
            pagination={{ clickable: true }}
            effect="fade"
            loop={true}
            className="h-full"
          >
            {profile.photos?.map((photo, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={photo}
                  alt={`${profile.firstName}'s photo ${index + 1}`}
                  className="h-full w-full object-cover rounded-t-lg"
                  width={600}
                  height={800}
                  priority={index === 0}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Profile Details */}
        <ScrollArea className="px-4 pb-4 h-[calc(90vh-24rem)] md:h-[calc(90vh-28rem)]">
          <div className="space-y-4">
            {/* Header Section */}
            <div className="-mt-8 flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                  <span className="text-muted-foreground">, {profile.age}</span>
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.course} • Year {profile.yearOfStudy}
                </p>
              </div>
              <Avatar className="h-14 w-14 border-2 border-white">
                <AvatarImage src={profile.photos?.[0]} />
                <AvatarFallback className="bg-pink-500 text-white">
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Bio Section */}
            <div className="space-y-2">
              <h3 className="font-medium text-pink-600">About</h3>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {profile.bio}
              </p>
            </div>

            {/* Interests Section */}
            {profile.interests?.length ? (
              <div className="space-y-2">
                <h3 className="font-medium text-pink-600">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-pink-100/50 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Social Links */}
            {(profile.instagram || profile.spotify) && (
              <div className="space-y-2">
                <h3 className="font-medium text-pink-600">Socials</h3>
                <div className="flex gap-4">
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      className="flex items-center gap-2 text-sm hover:text-pink-600"
                    >
                      <FaInstagram className="h-5 w-5" />
                      <span>@{profile.instagram}</span>
                    </a>
                  )}
                  {profile.spotify && (
                    <a
                      href={profile.spotify}
                      target="_blank"
                      className="flex items-center gap-2 text-sm hover:text-pink-600"
                    >
                      <FaSpotify className="h-5 w-5" />
                      <span>Spotify</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Fixed Like Button */}
        <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800 backdrop-blur border-t p-4 rounded-b-lg shadow-md">
          <Button
            className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
            onClick={() => onLikeBack(profile.userId)}
          >
            <Heart className="w-5 h-5 mr-2" />
            Like Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
