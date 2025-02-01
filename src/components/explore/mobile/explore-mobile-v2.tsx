"use client";

import { useState, useCallback } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "../cards/swipe-card";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Undo2, Star, User2, Bell } from "lucide-react";
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
    <div className="relative h-screen">
      {/* Remove top navbar */}
      
      {/* Cards Stack */}
      <div className="relative w-full h-[calc(100vh-5rem)] mx-auto">
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
                  scale: isTop ? 1 : 0.95,
                  opacity: isTop ? 1 : 0.6,
                  zIndex: isTop ? 10 : index,
                  transform: isTop ? 'none' : `translateY(${(currentIndex - index) * 12}px)`,
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background border-t border-border">
        <div className="flex justify-around items-center h-16 px-4">
          <Button variant="ghost" size="icon">
            <User2 className="h-6 w-6 text-muted-foreground" />
          </Button>
          
          {/* Swipe Controls */}
          <div className="flex gap-4">
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
              className="h-14 w-14 rounded-full border-2 shadow-lg"
              onClick={() => handleSwipe("right")}
              disabled={isAnimating}
            >
              <Heart className="h-6 w-6 text-pink-500" />
            </Button>
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchedProfile={matchedProfile!}
        currentUserProfile={currentUserProfile}
      />
    </div>
  );
} 