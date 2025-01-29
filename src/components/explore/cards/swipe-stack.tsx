"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { SwipeCard } from "./swipe-card";
import type { Profile } from "@/db/schema";
import {
  recordSwipe,
  undoLastSwipe,
  getLikedProfiles,
  getLikedByProfiles,
} from "@/lib/actions/explore.actions";
import { useToast } from "@/hooks/use-toast";

import { MatchModal } from "../modals/match-modal";
import { SwipeControls } from "../controls/swipe-controls";
import { LikedAvatars } from "./liked-avatars";
import { NoMoreProfiles } from "../empty-state";
import { SidePanels } from "./side-panels";

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
  const [likedByProfiles, setLikedByProfiles] = useState<Profile[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [currentSwipeDirection, setCurrentSwipeDirection] = useState<
    "left" | "right" | null
  >(null);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Load both liked and liked-by profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      // Load liked profiles
      const { profiles: liked, error: likedError } = await getLikedProfiles();
      if (likedError) {
        toast({
          variant: "destructive",
          description: "Couldn't load your crushes 😅",
        });
        return;
      }
      setLikedProfiles(liked);

      // Load profiles that liked you
      const { profiles: likedBy } = await getLikedByProfiles();
      setLikedByProfiles(likedBy);

      // Check if there are any matches to show
      const hasNewMatch = liked.some((profile) => profile.isMatch);
      if (hasNewMatch) {
        setShowMatch(true);
      }
    };

    loadProfiles();
  }, [toast]);

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

    setTimeout(() => {
      if (direction === "right") {
        const updatedProfile = {
          ...profile,
          isMatch: result.isMatch ?? null,
        } satisfies Profile;
        setLikedProfiles((prev) => [...prev, updatedProfile]);
        if (result.isMatch) {
          setMatchedProfile(updatedProfile);
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
    <div className="relative flex flex-col lg:flex-row w-full">
      {/* Side Panels - Fixed with reduced width */}
      <div className="lg:w-[320px] lg:fixed lg:left-0 lg:top-[80px] lg:bottom-0 lg:pl-4">
        <SidePanels
          profiles={likedProfiles}
          likedByProfiles={likedByProfiles}
          onUnlike={async (profileId) => {
            const result = await undoLastSwipe(profileId);
            if (result.success) {
              setLikedProfiles((prev) =>
                prev.filter((p) => p.userId !== profileId)
              );
            }
          }}
          onLikeBack={(profileId) => {
            setLikedByProfiles((prev) =>
              prev.filter((p) => p.userId !== profileId)
            );
          }}
        />
      </div>

      {/* Main Swipe Area */}
      <div className="flex-1 lg:ml-[160px] flex flex-col items-center justify-start pt-6">
        <div className="w-full max-w-[420px] mx-auto px-4">
          <div className="mb-6">
            <LikedAvatars profiles={likedProfiles} />
          </div>

          {/* Card Container - Fixed dimensions with proper centering */}
          <div className="relative h-[600px] w-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
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
            </div>

            {profiles.length === 0 && (
              <NoMoreProfiles initialLikedProfiles={likedProfiles} />
            )}
          </div>

          <div className="mt-8 max-w-sm mx-auto">
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
        </div>
      </div>

      {showMatch && matchedProfile && (
        <MatchModal
          open={showMatch}
          onOpenChange={setShowMatch}
          matchedProfile={matchedProfile}
        />
      )}
    </div>
  );
}
