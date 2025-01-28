"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import type { Profile } from "@/db/schema";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ViewMoreModal } from "./view-more";

interface ProfileDetailsProps {
  profile: Profile;
  isMatch?: boolean;
  trigger: React.ReactNode;
  isMobileSheet?: boolean;
}

export function ProfileDetails({
  profile,
  isMatch,
  trigger,
  isMobileSheet = false,
}: ProfileDetailsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);

  const content = (
    <div className="space-y-3">
      {/* Photos Carousel */}
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          <SwiperSlide>
            <Image
              src={Array.isArray(profile.photos) ? profile.photos[0] : ""}
              alt={`${profile.firstName}'s photo`}
              className="h-full w-full object-cover"
              width={500}
              height={700}
            />
          </SwiperSlide>
          {profile.photos?.map((photo, index) => (
            <SwiperSlide key={index}>
              <Image
                src={photo}
                alt={`${profile.firstName}'s additional photo`}
                className="h-full w-full object-cover"
                width={500}
                height={700}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Profile Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-xs text-muted-foreground">
              {profile.course} • Year {profile.yearOfStudy}
            </p>
          </div>
          {isMatch && (
            <WhatsAppButton phoneNumber={profile.phoneNumber || ""} size="sm" />
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Social Links */}
        <div className="flex gap-2">
          {profile.instagram && (
            <a
              href={profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:opacity-80 transition-opacity"
            >
              📸
            </a>
          )}
          {profile.spotify && (
            <a
              href={profile.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:opacity-80 transition-opacity"
            >
              🎵
            </a>
          )}
        </div>

        {/* Add View More button for matches */}
        {isMatch && (
          <div className="pt-1">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowViewMore(true);
              }}
              size="sm"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xs"
            >
              View More ✨
            </Button>
          </div>
        )}
      </div>

      {/* View More Modal */}
      <ViewMoreModal
        profile={profile}
        isOpen={showViewMore}
        onClose={() => setShowViewMore(false)}
      />
    </div>
  );

  if (isMobile || isMobileSheet) {
    return (
      <>
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[80vh] px-0">
            <SheetHeader className="px-4 mb-4">
              <SheetTitle className="text-lg">Profile Details</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">{content}</div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent side="right" align="start" className="w-64 p-3">
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}
