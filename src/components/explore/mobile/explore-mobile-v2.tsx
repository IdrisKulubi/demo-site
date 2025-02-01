/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback, useEffect } from "react";
import { matches, Profile } from "@/db/schema";
import { SwipeCard } from "../cards/swipe-card";
import { AnimatePresence } from "framer-motion";
import { Heart, X, User2, Bell, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordSwipe, undoLastSwipe } from "@/lib/actions/explore.actions";
import { useToast } from "@/hooks/use-toast";
import { MatchModal } from "../modals/match-modal";
import { EmptyMobileView } from "../cards/empty-mobile";
import { MatchesModal } from "../modals/matches-modal";
import { LikesModal } from "../modals/likes-modal";
import { getMatches } from "@/lib/actions/explore.actions";


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
  const [swipedProfiles, setSwipedProfiles] = useState<Profile[]>([]);
  const { toast } = useToast();
  const [showMatches, setShowMatches] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [likes, setLikes] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const result = await getMatches();
      if (result.matches) {
        setMatches(result.matches);
      }
    };
    
    fetchMatches();
  }, []);

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
          title: "Yasss 💖",
          description: `You liked ${profiles[currentIndex].firstName}! Fingers crossed for a match!`,
          variant: "default",
          className: "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none",
        });
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
    
    toast({
      title: "Time Machine Activated! ⏰",
      description: "Brought back the last profile for another chance!",
      variant: "default",
      className: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none",
    });
  }, [swipedProfiles, toast]);

  return (
    <div className="relative h-screen">
      {currentIndex >= 0 ? (
        <>
          <div className="relative w-[calc(100%-32px)] mx-auto h-[calc(100vh-5rem)]">
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
                    borderRadius: '16px',
                  }}
                >
                  {/* Controls Inside Card */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-10">
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
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background/80 backdrop-blur-lg border-t border-border">
            <div className="flex justify-around items-center h-16 px-4">
              <Button variant="ghost" size="icon" onClick={() => setShowMatches(true)}>
                <Heart className="h-6 w-6 text-pink-500" />
              </Button>
              
              <Button variant="ghost" size="icon">
                <User2 className="h-6 w-6 text-muted-foreground" />
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setShowLikes(true)}>
                <Star className="h-6 w-6 text-yellow-500" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyMobileView
          likedProfiles={[]}
          onShare={() => {}}
          onUnlike={async () => {}}
        />
      )}
      
      {/* Modals */}
      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchedProfile={matchedProfile!}
        currentUserProfile={currentUserProfile}
      />
      
      <MatchesModal 
        isOpen={showMatches} 
        onClose={() => setShowMatches(false)}
        matches={matches}
      />
      
      <LikesModal
        isOpen={showLikes}
        onClose={() => setShowLikes(false)}
        likes={likes}
      />
    </div>
  );
} 