"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "./swipe-card";
import type { Profile } from "@/db/schema";
import { recordSwipe, undoLastSwipe } from "@/lib/actions/explore.actions";
import { useToast } from "@/hooks/use-toast";

import { MatchModal } from "../modals/match-modal";
import { SwipeControls } from "../controls/swipe-controls";

interface SwipeStackProps {
  initialProfiles: Profile[];
}

export function SwipeStack({ initialProfiles }: SwipeStackProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const { toast } = useToast();

  // Reset match state when profiles change
  useEffect(() => {
    setShowMatch(false);
    setActiveIndex(0);
  }, [profiles]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (activeIndex >= profiles.length) return;

    const currentProfile = profiles[activeIndex];
    const result = await recordSwipe(
      currentProfile.userId,
      direction === "right" ? "like" : "pass"
    );

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Swipe failed 😢",
        description: "Couldn't register your swipe. Try again",
      });
      return;
    }

    // Only show match if compatibility check passed
    if (result.isMatch) {
      setShowMatch(true);
    }

    // Remove swiped profile from stack
    setProfiles((prev) =>
      prev.filter((p) => p.userId !== currentProfile.userId)
    );
  };

  const handleUndo = async () => {
    const result = await undoLastSwipe();
    if (result.success) {
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative h-[80vh] w-full max-w-md mx-auto">
      <AnimatePresence>
        {profiles.map((profile, index) => (
          <SwipeCard
            key={profile.userId}
            profile={profile}
            onSwipe={handleSwipe}
            active={index === activeIndex}
          />
        ))}
      </AnimatePresence>

      <SwipeControls
        onSwipeLeft={() => handleSwipe("left")}
        onSwipeRight={() => handleSwipe("right")}
        onUndo={handleUndo}
        className="absolute bottom-8 left-0 right-0"
      />

      <MatchModal open={showMatch} onOpenChange={setShowMatch} />
    </div>
  );
}
