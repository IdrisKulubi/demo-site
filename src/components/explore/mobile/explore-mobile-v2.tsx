"use client";

import { useState, useCallback } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "../cards/swipe-card";
import {  AnimatePresence } from "framer-motion";
import { Heart, X,User2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordSwipe } from "@/lib/actions/explore.actions";
import { MatchModal } from "../modals/match-modal";

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
      {/* Cards Stack */}
      <div className="relative w-full h-[calc(100vh-5rem)] mx-auto">
        <AnimatePresence>
          {profiles[currentIndex] && (
            <SwipeCard
              key={profiles[currentIndex].userId}
              profile={profiles[currentIndex]}
              onSwipe={handleSwipe}
              active={true}
              animate={swipeDirection}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background/80 backdrop-blur-lg border-t border-border">
        <div className="flex justify-around items-center h-16 px-4">
          <Button variant="ghost" size="icon">
            <User2 className="h-6 w-6 text-muted-foreground" />
          </Button>
          
          {/* Swipe Controls */}
          <div className="flex gap-6">
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