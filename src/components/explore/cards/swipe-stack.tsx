"use client";

import {  useCallback, useState } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "./swipe-card";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { recordSwipe } from "@/lib/actions/explore.actions";
import { Button } from "@/components/ui/button";
import { MatchModal } from "@/components/explore/modals/match-modal";

interface SwipeStackProps {
  initialProfiles: Profile[];
  currentUserProfile: Profile;
  onMatch?: (profile: Profile) => void;
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

export function SwipeStack({ initialProfiles, currentUserProfile }: SwipeStackProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(initialProfiles.length - 1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  const handleSwipe = useCallback(async (direction: "left" | "right") => {
    if (isAnimating || !profiles[currentIndex]) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    const result = await recordSwipe(
      profiles[currentIndex].userId,
      direction === "right" ? "like" : "pass"
    );

    if (direction === "right" && result.isMatch) {
      setMatchedProfile(profiles[currentIndex]);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, isAnimating, profiles]);

  return (
    <div className="relative max-w-sm mx-auto h-[calc(100vh-4rem)]">
      <AnimatePresence>
        {profiles[currentIndex] && (
          <SwipeCard
            key={profiles[currentIndex].userId}
            profile={profiles[currentIndex]}
            onSwipe={handleSwipe}
            active={true}
            animate={swipeDirection}
            variants={swipeVariants}
            style={{
              position: 'absolute',
              width: '100%',
              height: 'calc(100% - 5rem)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Tinder-style Controls - Moved closer to card */}
      {profiles[currentIndex] && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-6 pb-4">
          <Button
            size="lg"
            variant="outline"
            className="h-14 w-14 rounded-full border-2 shadow-lg hover:border-red-500 hover:bg-red-500/10"
            onClick={() => handleSwipe("left")}
            disabled={isAnimating}
          >
            <X className="h-6 w-6 text-red-500" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full border-2 shadow-lg hover:border-pink-500 hover:bg-pink-500/10"
            onClick={() => handleSwipe("right")}
            disabled={isAnimating}
          >
            <Heart className="h-8 w-8 text-pink-500" />
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!profiles[currentIndex] && (
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

      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchedProfile={matchedProfile!}
        currentUserProfile={currentUserProfile}
      />
    </div>
  );
}
