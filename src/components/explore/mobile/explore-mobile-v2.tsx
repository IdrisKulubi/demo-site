/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "../cards/swipe-card";
import { AnimatePresence } from "framer-motion";
import { Heart, X, User2, Bell, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  recordSwipe,
  undoLastSwipe,
  getMatches,
  getLikedByProfiles,
} from "@/lib/actions/explore.actions";
import { useToast } from "@/hooks/use-toast";
import { MatchModal } from "../modals/match-modal";
import { EmptyMobileView } from "../cards/empty-mobile";
import { LikesModal } from "../modals/likes-modal";
import { ProfilePreviewModal } from "../modals/profile-preview-modal";
import { useInterval } from "@/hooks/use-interval";
import { handleLike, handleUnlike } from "@/lib/actions/like.actions";
import { MatchesModal } from "../modals/matches-modal";

interface ExploreMobileV2Props {
  initialProfiles: Profile[];
  currentUserProfile: Profile;
  currentUser: { id: string };
  likedProfiles: Profile[];
  likedByProfiles: Profile[];
}

export function ExploreMobileV2({
  initialProfiles,
  currentUserProfile,
  currentUser,
  likedProfiles: initialLikedProfiles,
  likedByProfiles: initialLikedByProfiles,
}: ExploreMobileV2Props) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [currentIndex, setCurrentIndex] = useState(initialProfiles.length - 1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [swipedProfiles, setSwipedProfiles] = useState<Profile[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  // Initialize matches from likedProfiles where isMatch is true
  const [matches, setMatches] = useState<Profile[]>(
    initialLikedProfiles.filter((p) => p.isMatch)
  );

  // Initialize likes from likedByProfiles
  const [likes, setLikes] = useState<Profile[]>(initialLikedByProfiles);

  const [previewProfile, setPreviewProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Fetch and sync matches and likes
  const syncMatchesAndLikes = useCallback(async () => {
    try {
      const [matchesResult, likesResult] = await Promise.all([
        getMatches(),
        getLikedByProfiles(),
      ]);

      if (matchesResult.matches) {
        setMatches(matchesResult.matches as Profile[]);
      }

      if (likesResult.profiles) {
        // Filter out profiles that are now matches
        const newLikes = likesResult.profiles.filter(
          (profile) =>
            !matchesResult.matches?.some(
              (match) => match.userId === profile.userId
            )
        );
        setLikes(newLikes);
      }
    } catch (error) {
      console.error("Error syncing matches and likes:", error);
    }
  }, []);

  // Initial sync
  useEffect(() => {
    syncMatchesAndLikes();
  }, [syncMatchesAndLikes]);

  // Periodic sync every 30 seconds
  useInterval(syncMatchesAndLikes, 30000);

  // Sync after any swipe action
  useEffect(() => {
    if (swipedProfiles.length > 0) {
      syncMatchesAndLikes();
    }
  }, [swipedProfiles, syncMatchesAndLikes]);

  const handleSwipe = useCallback(
    async (direction: "left" | "right") => {
      if (isAnimating || !profiles[currentIndex]) return;

      setIsAnimating(true);
      setSwipeDirection(direction);

      const result = await recordSwipe(
        profiles[currentIndex].userId,
        direction === "right" ? "like" : "pass"
      );

      if (direction === "right") {
        if (result.isMatch) {
          const updatedProfile = {
            ...profiles[currentIndex],
            isMatch: true,
            matchId: result.matchedProfile?.id,
          } satisfies Profile;
          setMatchedProfile(updatedProfile);
          setMatches((prev) => [...prev, updatedProfile]);
        } else {
          toast({
            title: "Yasss 💖",
            description: `You liked ${profiles[currentIndex].firstName}! Fingers crossed for a match!`,
            variant: "default",
            className:
              "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none",
          });
        }
      }

      setSwipedProfiles((prev) => [...prev, profiles[currentIndex]]);

      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setSwipeDirection(null);
        setIsAnimating(false);
      }, 300);
    },
    [currentIndex, isAnimating, profiles, toast]
  );

  const handleRevert = useCallback(async () => {
    if (swipedProfiles.length === 0) return;

    const lastProfile = swipedProfiles[swipedProfiles.length - 1];
    await undoLastSwipe(lastProfile.userId);

    setProfiles((prev) => [...prev, lastProfile]);
    setSwipedProfiles((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev + 1);

    toast({
      title: "Time Machine Activated! ⏰",
      description: "Brought back the last profile for another chance!",
      variant: "default",
      className:
        "bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none",
    });
  }, [swipedProfiles, toast]);

  const handleLikeBack = async (userId: string) => {
    try {
      const result = await handleLike(userId);
      if (result.success) {
        // Remove from likes immediately
        setLikes((prev) => prev.filter((profile) => profile.userId !== userId));

        if (result.isMatch && result.matchedProfile) {
          // Add to matches immediately
          setMatches((prev) => [...prev, result.matchedProfile as Profile]);
        }

        // Sync with server
        syncMatchesAndLikes();
      }
      return result;
    } catch (error) {
      console.error("Error in handleLikeBack:", error);
      return { success: false };
    }
  };

  const handleUnlike = async (
    userId: string
  ): Promise<{ success: boolean }> => {
    try {
      const result = await handleUnlike(userId);
      if (result.success) {
        // Remove from likes immediately
        setLikes((prev) => prev.filter((profile) => profile.userId !== userId));
        // Also remove from matches if it was a match
        setMatches((prev) =>
          prev.filter((profile) => profile.userId !== userId)
        );

        // Sync with server to ensure consistency
        syncMatchesAndLikes();
      }
      return result;
    } catch (error) {
      console.error("Error in handleUnlike:", error);
      return { success: false };
    }
  };

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
                  onRevert={handleRevert}
                  active={true}
                  animate={swipeDirection}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "16px",
                  }}
                  onViewProfile={() =>
                    setPreviewProfile(profiles[currentIndex])
                  }
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMatches(true)}
                className="relative"
              >
                <Heart className="h-6 w-6 text-pink-500" />
                {matches.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                    {matches.length}
                  </span>
                )}
              </Button>

              <Button variant="ghost" size="icon">
                <User2 className="h-6 w-6 text-muted-foreground" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLikes(true)}
                className="relative"
              >
                <Star className="h-6 w-6 text-yellow-500" />
                {likes.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                    {likes.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyMobileView
          likedProfiles={matches}
          onShare={() => {}}
          onUnlike={async () => {}}
          currentUser={currentUser}
        />
      )}

      {/* Modals */}
      <MatchModal
        isOpen={!!matchedProfile}
        onClose={() => setMatchedProfile(null)}
        matchedProfile={matchedProfile!}
        currentUserProfile={currentUserProfile}
        currentUser={currentUser}
      />

      <MatchesModal
        isOpen={showMatches}
        onClose={() => setShowMatches(false)}
        matches={matches}
        currentUser={currentUser}
      />

      <LikesModal
        isOpen={showLikes}
        onClose={() => setShowLikes(false)}
        likes={likes}
        onUnlike={handleUnlike}
        onUpdate={syncMatchesAndLikes}
      />

      <ProfilePreviewModal
        isOpen={!!previewProfile}
        onClose={() => setPreviewProfile(null)}
        profile={previewProfile}
      />
    </div>
  );
}
