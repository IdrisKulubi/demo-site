"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeCard } from "./swipe-card";
import type { Profile } from "@/db/schema";
import { recordSwipe, undoLastSwipe } from "@/lib/actions/explore.actions";
import { useToast } from "@/hooks/use-toast";

import { MatchModal } from "../modals/match-modal";
import { SwipeControls } from "../controls/swipe-controls";
import { LikedAvatars } from "./liked-avatars";
import { LikedPanel } from "./liked-panel";

const swipeAnimationVariants = {
  right: {
    x: "150%",
    y: -50,
    rotate: 20,
    opacity: 0,
    transition: { duration: 0.5 },
  },
  left: {
    x: "-150%",
    y: -50,
    rotate: -20,
    opacity: 0,
    transition: { duration: 0.5 },
  },
};

interface SwipeStackProps {
  initialProfiles: Profile[];
}

export function SwipeStack({ initialProfiles }: SwipeStackProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [swipedProfiles, setSwipedProfiles] = useState<Profile[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<
    "left" | "right" | null
  >(null);
  const { toast } = useToast();

  const handleSwipe = async (direction: "left" | "right", profile: Profile) => {
    setCurrentSwipeDirection(direction);
    const swipeType = direction === "right" ? "like" : "pass";

    // First make the API call
    const result = await recordSwipe(profile.userId, swipeType);

    if (!result.success) {
      toast({
        variant: "destructive",
        description: result.error || "Couldn't record swipe 😅",
      });
      return;
    }

    // Then update UI after we know the swipe was successful
    setTimeout(() => {
      if (direction === "right") {
        setLikedProfiles((prev) => [...prev, profile]);
        if (result.isMatch) {
          setShowMatch(true);
        }
      }
      setSwipedProfiles((prev) => [...prev, profile]);
      setProfiles((prev) => prev.slice(0, -1));
      setCurrentSwipeDirection(null);
    }, 500);
  };

  const handleUndo = async () => {
    if (swipedProfiles.length === 0) return;

    const lastSwiped = swipedProfiles[swipedProfiles.length - 1];
    const result = await undoLastSwipe(lastSwiped.userId);

    if (result.success) {
      setProfiles((prev) => [...prev, lastSwiped]);
      setSwipedProfiles((prev) => prev.slice(0, -1));
      setLikedProfiles((prev) =>
        prev.filter((p) => p.userId !== lastSwiped.userId)
      );
    } else {
      toast({
        variant: "destructive",
        description: result.error || "Couldn't undo swipe 😅",
      });
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <LikedPanel
        profiles={likedProfiles}
        onUnlike={async (profileId) => {
          const result = await undoLastSwipe(profileId);
          if (result.success) {
            setLikedProfiles((prev) =>
              prev.filter((p) => p.userId !== profileId)
            );
          }
        }}
      />
      <LikedAvatars profiles={likedProfiles} />

      <div className="relative h-[500px] w-full flex flex-col items-center">
        <AnimatePresence mode="popLayout">
          {profiles.map((profile, index) => (
            <SwipeCard
              key={`${profile.userId}-${index}`}
              profile={profile}
              active={index === profiles.length - 1}
              onSwipe={(dir) => handleSwipe(dir, profile)}
              animate={
                index === profiles.length - 1
                  ? currentSwipeDirection
                  : undefined
              }
              variants={swipeAnimationVariants}
            />
          ))}
        </AnimatePresence>

        {profiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center text-xl text-pink-600/80"
          >
            No more profiles to swipe ✨
          </motion.div>
        )}
      </div>

      <div className="mt-4">
        <SwipeControls
          onSwipeLeft={() =>
            profiles.length > 0 &&
            handleSwipe("left", profiles[profiles.length - 1])
          }
          onSwipeRight={() =>
            profiles.length > 0 &&
            handleSwipe("right", profiles[profiles.length - 1])
          }
          onUndo={handleUndo}
          disabled={swipedProfiles.length === 0}
        />
      </div>

      {showMatch && <MatchModal open={showMatch} onOpenChange={setShowMatch} />}
    </div>
  );
}
