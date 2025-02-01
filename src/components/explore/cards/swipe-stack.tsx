"use client";

import { useState, useEffect, useCallback } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "./swipe-card";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recordSwipe } from "@/lib/actions/explore.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwipeStackProps {
  initialProfiles: Profile[];
  onMatch?: (profile: Profile) => void;
  onEmptyStack?: () => void;
}

const swipeVariants = {
  left: {
    x: -1000,
    opacity: 0,
    rotate: -30,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  right: {
    x: 1000,
    opacity: 0,
    rotate: 30,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function SwipeStack({ initialProfiles, onMatch, onEmptyStack }: SwipeStackProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(initialProfiles.length - 1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (currentIndex < 0) {
      onEmptyStack?.();
    }
  }, [currentIndex, onEmptyStack]);

  const handleSwipe = useCallback(async (direction: "left" | "right") => {
    if (isAnimating || !currentProfile) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    const result = await recordSwipe(
      currentProfile.userId,
      direction === "right" ? "like" : "pass"
    );

    if (!result.success) {
      toast({
        variant: "destructive",
        description: result.error || "Couldn't record swipe 😅",
      });
      setIsAnimating(false);
      return;
    }

    // If it's a match, notify parent component
    if (direction === "right" && result.isMatch) {
      onMatch?.(currentProfile);
    }

    // Delay state updates to allow animation to complete
    setTimeout(() => {
      setCurrentIndex((prev) => prev - 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [currentProfile, isAnimating, onMatch, toast]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleSwipe, isAnimating]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] md:h-[700px]">
      {/* Cards Stack */}
      <div className="relative w-full h-full">
        <AnimatePresence>
          {profiles.map((profile, index) => {
            const isTop = index === currentIndex;
            const isSecond = index === currentIndex - 1;

            return (
              <SwipeCard
                key={profile.userId}
                profile={profile}
                onSwipe={handleSwipe}
                active={isTop}
                animate={isTop ? swipeDirection : undefined}
                variants={swipeVariants}
                style={{
                  scale: isSecond ? 0.95 : 1,
                  opacity: isSecond ? 0.8 : 1,
                  zIndex: index,
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Swipe Controls */}
      {currentProfile && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4"
        >
          <Button
            size="lg"
            variant="outline"
            className={cn(
              "h-14 w-14 rounded-full border-2 shadow-lg transition-colors",
              "hover:border-red-500 hover:bg-red-500/10",
              isAnimating && "pointer-events-none opacity-50"
            )}
            onClick={() => handleSwipe("left")}
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className={cn(
              "h-14 w-14 rounded-full border-2 shadow-lg transition-colors",
              "hover:border-pink-500 hover:bg-pink-500/10",
              isAnimating && "pointer-events-none opacity-50"
            )}
            onClick={() => handleSwipe("right")}
          >
            <Heart className="h-8 w-8 text-pink-500" />
          </Button>
        </motion.div>
      )}

      {/* Empty State */}
      {!currentProfile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/50 dark:bg-background/50 backdrop-blur-sm rounded-3xl"
        >
          <span className="text-6xl mb-6">✨</span>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            No more profiles
          </h3>
          <p className="text-muted-foreground mt-2">
            Check back later for more potential matches!
          </p>
        </motion.div>
      )}
    </div>
  );
}
