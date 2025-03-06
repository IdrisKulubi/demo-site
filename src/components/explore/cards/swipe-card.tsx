"use client";

import { AnimationControls, motion } from "framer-motion";
import { Profile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  Instagram,
  Music,
  X,
  Undo,
  Heart,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { OptimizedImage } from "@/components/shared/optimized-image";

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: "left" | "right") => void;
  onRevert?: () => void;
  active: boolean;
  animate?: "left" | "right" | null;
  variants?: Record<string, unknown>; // Assuming motion.Variants is a type alias for Record<string, unknown>
  style?: React.CSSProperties;
  children?: React.ReactNode;
  isAnimating?: boolean;
  canRevert?: boolean;
  onViewProfile?: () => void;
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
  onViewProfile,
}: SwipeCardProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  // We need currentSlide for the Swiper component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  // Update the optimizedPhotos memo to use webp format and include width/quality params
  const optimizedPhotos = useMemo(() => {
    return [profile.profilePhoto, ...(profile.photos || [])]
      .filter(Boolean)
      .map((photo) => `${photo}?width=500&quality=70&format=webp`);
  }, [profile]);

  // Enhanced image prefetching with loading progress
  useEffect(() => {
    const prefetchImages = async () => {
      try {
        // Reset loading state
        setImagesLoaded(false);
        setLoadingProgress(0);
        
        // Import the prefetch function
        const { prefetchProfileImages } = await import(
          "@/lib/actions/image-prefetch"
        );
        
        // Create an array to track loaded images
        const imagesToLoad = optimizedPhotos.filter(Boolean) as string[];
        let loadedCount = 0;
        
        // Create image objects to track loading
        const imagePromises = imagesToLoad.map((src) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              loadedCount++;
              setLoadingProgress(Math.round((loadedCount / imagesToLoad.length) * 100));
              resolve();
            };
            img.onerror = () => {
              loadedCount++;
              setLoadingProgress(Math.round((loadedCount / imagesToLoad.length) * 100));
              resolve();
            };
          });
        });
        
        // Wait for all images to load
        await Promise.all(imagePromises);
        
        // Also call the service worker prefetch for caching
        await prefetchProfileImages(imagesToLoad);
        
        // Mark as loaded
        setImagesLoaded(true);
      } catch (error) {
        console.error("Prefetch failed:", error);
        // Even if prefetch fails, mark as loaded to show the profile
        setImagesLoaded(true);
      }
    };

    if (optimizedPhotos.length > 0 && active) {
      prefetchImages();
    } else if (!active) {
      // If not active, still prefetch in background but don't show loading state
      import("@/lib/actions/image-prefetch").then(
        module => module.prefetchProfileImages(optimizedPhotos.filter(Boolean) as string[])
      ).catch(error => console.error("Background prefetch failed:", error));
    }
  }, [optimizedPhotos, active]);

  return (
    <motion.div
      className={cn(
        "absolute w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-xl",
        "bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black",
        active && "cursor-grab active:cursor-grabbing"
      )}
      animate={animate ? (variants?.[animate] as AnimationControls) : undefined}
      style={{
        ...style,
        backgroundImage: "none",
        touchAction: "none",
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
      {/* Loading overlay */}
      {active && !imagesLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Loading profile...</p>
        </div>
      )}
      
      <div className="relative w-full h-full">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-full group"
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
        >
          {[profile.profilePhoto, ...(profile.photos || [])].map(
            (photo, index) => (
              <SwiperSlide key={index} className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
                {photo && (
                  <OptimizedImage
                    src={photo}
                    alt={`${profile.firstName}'s photo ${index + 1}`}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                    priority={index === 0 || index === 1} // Prioritize first two images
                    loading={index < 2 ? "eager" : "lazy"} // Eager load first two images
                  />
                )}
              </SwiperSlide>
            )
          )}
        </Swiper>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">
                {profile.firstName}, {profile.age}
              </h2>
              <span className="text-blue-400">✓</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4" />
              <span>
                {profile.course}, Year {profile.yearOfStudy}
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm line-clamp-2 opacity-90">{profile.bio}</p>
            )}

            {profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.interests.map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/20 text-xs backdrop-blur-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

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

        {/* Controls overlay - Only show when active and images are loaded */}
        {active && imagesLoaded && (
          <div className="fixed bottom-16 left-0 right-0 flex justify-center items-center gap-6 z-20">
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-full border-2 shadow-lg bg-blue-500/20 border-blue-500 transition-transform duration-200 hover:scale-110"
              onClick={onRevert}
              disabled={isAnimating}
            >
              <Undo className="h-5 w-5 text-blue-500" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 shadow-lg bg-red-500/20 border-red-500 transition-transform duration-200 hover:scale-110"
              onClick={() => onSwipe("left")}
              disabled={isAnimating}
            >
              <X className="h-6 w-6 text-red-500" />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 shadow-lg bg-pink-500/20 border-pink-500 transition-transform duration-200 hover:scale-110"
              onClick={() => onSwipe("right")}
              disabled={isAnimating}
            >
              <Heart className="h-6 w-6 text-pink-500" />
            </Button>
          </div>
        )}

        {/* View Profile Button */}
        {active && imagesLoaded && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm"
              onClick={onViewProfile}
            >
              <User className="h-5 w-5 text-white" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
