"use client";

import {  useCallback, useState } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "./swipe-card";
import { AnimatePresence } from "framer-motion";
import { Heart, X, ArrowLeft } from "lucide-react";
import { recordSwipe, undoLastSwipe } from "@/lib/actions/explore.actions";
import { Button } from "@/components/ui/button";
import { MatchModal } from "@/components/explore/modals/match-modal";

import { useToast } from "@/hooks/use-toast";
import { SidePanels } from "./side-panels";
import { NoMoreProfiles } from "../empty-state";

interface SwipeStackProps {
  initialProfiles: Profile[];
  currentUserProfile: Profile;
  likedByProfiles: Profile[];
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

export function SwipeStack({ initialProfiles, currentUserProfile, likedByProfiles }: SwipeStackProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(initialProfiles.length - 1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [swipedProfiles, setSwipedProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();

  const handleSwipe = useCallback(async (direction: "left" | "right") => {
    if (isAnimating || !profiles[currentIndex]) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    // Only record like when swiping right
    if (direction === "right") {
      const result = await recordSwipe(
        profiles[currentIndex].userId,
        "like"
      );

      if (result.success) {
        if (result.isMatch) {
          setMatchedProfile(profiles[currentIndex]);
        } else {
          toast({
            title: "Yasss! 💖",
            description: `You liked ${profiles[currentIndex].firstName}! Fingers crossed for a match!`,
            variant: "default",
            className: "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none",
          });
        }
      }
    }

    setSwipedProfiles(prev => [...prev, profiles[currentIndex]]);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [currentIndex, isAnimating, profiles, toast]);

  const handleRevert = useCallback(async () => {
    if (swipedProfiles.length === 0) return;

    const lastProfile = swipedProfiles[swipedProfiles.length - 1];
    await undoLastSwipe(lastProfile.userId);
    
    setProfiles(prev => [...prev, lastProfile]);
    setSwipedProfiles(prev => prev.slice(0, -1));
    setCurrentIndex(prev => prev + 1);
  }, [swipedProfiles]);

  const handleLikeBack = async (profileId: string) => {
    await handleSwipe("right");
  };

  return (
    <div className="flex w-full max-w-7xl mx-auto relative">
      {/* Side Panel */}
      <div className="hidden lg:block w-80 fixed left-4 top-24">
        <SidePanels
          profiles={swipedProfiles.filter(p => p.isMatch)}
          likedByProfiles={likedByProfiles}
          onUnlike={handleRevert}
          onLikeBack={handleLikeBack}
        />
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex justify-center lg:ml-96">
        <div className="w-full max-w-[400px]">
          <div className="relative h-[600px]">
            <AnimatePresence>
              {profiles[currentIndex] && (
                <SwipeCard
                  key={profiles[currentIndex].userId}
                  profile={profiles[currentIndex]}
                  onSwipe={handleSwipe}
                  onRevert={handleRevert}
                  active={false}
                  animate={swipeDirection}
                  variants={swipeVariants}
                  isAnimating={isAnimating}
                  canRevert={swipedProfiles.length > 0}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                  }}
                />
              )}
            </AnimatePresence>
          </div>
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


