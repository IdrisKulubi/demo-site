"use client";

import {  useCallback, useState } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "./swipe-card";
import { AnimatePresence } from "framer-motion";
import { Heart, X, ArrowLeft } from "lucide-react";
import { recordSwipe, undoLastSwipe } from "@/lib/actions/explore.actions";
import { Button } from "@/components/ui/button";
import { MatchModal } from "@/components/explore/modals/match-modal";
import { NoMoreProfiles } from "../empty-state";

import { useToast } from "@/hooks/use-toast";
import { SidePanels } from "./side-panels";

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

    const result = await recordSwipe(
      profiles[currentIndex].userId,
      direction === "right" ? "like" : "pass"
    );

    if (direction === "right") {
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

    if (result.success && result.isMatch && result.matchedProfile) {
      setMatchedProfile(result.matchedProfile);
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

  return (
    <div className="flex gap-6 h-full max-h-[calc(100vh-200px)]">
      {/* Left Side Panel */}
      <div className="hidden lg:block w-80">
        <SidePanels
          profiles={swipedProfiles}
          likedByProfiles={likedByProfiles}
          onUnlike={handleRevert}
          onLikeBack={async (profileId) => {
            const result = await recordSwipe(profileId, "like");
            if (result.success && result.isMatch && result.matchedProfile)  {
              setMatchedProfile(result.matchedProfile);
            }
          }}
        />
      </div>

      {/* Main Card Area */}
      <div className="flex-1 max-w-[400px] mx-auto">
        <div className="relative h-[600px]">
          <AnimatePresence>
            {profiles[currentIndex] && (
              <SwipeCard
                key={profiles[currentIndex].userId}
                profile={profiles[currentIndex]}
                onSwipe={handleSwipe}
                active={false}
                animate={swipeDirection}
                variants={swipeVariants}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                }}
              >
                {/* Mobile Controls Inside Card */}
                <div className="lg:hidden absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-10">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 shadow-lg bg-white/90"
                    onClick={() => handleSwipe("left")}
                    disabled={isAnimating}
                  >
                    <X className="h-6 w-6 text-red-500" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-12 w-12 rounded-full border-2 shadow-lg bg-white/90"
                    onClick={handleRevert}
                    disabled={swipedProfiles.length === 0 || isAnimating}
                  >
                    <ArrowLeft className="h-5 w-5 text-blue-500" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-14 w-14 rounded-full border-2 shadow-lg bg-white/90"
                    onClick={() => handleSwipe("right")}
                    disabled={isAnimating}
                  >
                    <Heart className="h-6 w-6 text-pink-500" />
                  </Button>
                </div>
              </SwipeCard>
            )}
          </AnimatePresence>

          {/* Desktop Controls */}
          <div className="hidden lg:flex absolute -bottom-20 left-0 right-0 justify-center items-center gap-6">
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
              className="h-12 w-12 rounded-full border-2 shadow-lg hover:border-blue-500 hover:bg-blue-500/10"
              onClick={handleRevert}
              disabled={swipedProfiles.length === 0 || isAnimating}
            >
              <ArrowLeft className="h-5 w-5 text-blue-500" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 w-14 rounded-full border-2 shadow-lg hover:border-pink-500 hover:bg-pink-500/10"
              onClick={() => handleSwipe("right")}
              disabled={isAnimating}
            >
              <Heart className="h-6 w-6 text-pink-500" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {!profiles[currentIndex] && (
          <NoMoreProfiles initialLikedProfiles={swipedProfiles} />
        )}
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
