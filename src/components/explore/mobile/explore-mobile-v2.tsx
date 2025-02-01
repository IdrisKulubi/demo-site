"use client";

import { useState, useCallback } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "../cards/swipe-card";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Undo2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordSwipe, undoLastSwipe } from "@/lib/actions/explore.actions";
import { useToast } from "@/hooks/use-toast";
import { MatchModal } from "../modals/match-modal";
import { cn } from "@/lib/utils";

interface ExploreMobileV2Props {
  initialProfiles: Profile[];
  currentUserProfile: Profile;
}

export function ExploreMobileV2({ initialProfiles, currentUserProfile }: ExploreMobileV2Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(initialProfiles.length - 1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  const handleSwipe = useCallback(async (direction: "left" | "right") => {
    if (isAnimating || !profiles[currentIndex]) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    const result = await recordSwipe(
      profiles[currentIndex].userId,
      direction === "right" ? "like" : "pass"
    );

    if (!result.success) {
      toast({
        variant: "destructive",
        description: result.error || "Couldn't record swipe"
      });
      setIsAnimating(false);
      return;
    }

    if (direction === "right" && result.isMatch) {
      setMatchedProfile(profiles[currentIndex]);
    }

    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, isAnimating, profiles, toast]);

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Cards Stack */}
      <div className="relative w-full h-[calc(100vh-12rem)] mx-auto">
        <AnimatePresence>
          {profiles.map((profile, index) => {
            if (index < currentIndex - 2 || index > currentIndex) return null;

            const isTop = index === currentIndex;
            const isSecond = index === currentIndex - 1;

            return (
              <SwipeCard
                key={profile.userId}
                profile={profile}
                onSwipe={handleSwipe}
                active={isTop}
                animate={isTop ? swipeDirection : undefined}
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

      {/* Tinder-like Control Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          className="h-14 w-14 rounded-full border-2 shadow-lg"
          onClick={() => handleSwipe("left")}
          disabled={isAnimating}
        >
          <X className="h-6 w-6 text-red-500" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 shadow-lg"
          onClick={() => handleSwipe("right")}
          disabled={isAnimating}
        >
          <Heart className="h-8 w-8 text-pink-500" />
        </Button>
      </div>

      {/* Match Modal */}
      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchedProfile={matchedProfile!}
        currentUserProfile={currentUserProfile}
      />
    </div>
  );
} 