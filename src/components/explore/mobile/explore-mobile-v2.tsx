/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Profile } from "@/db/schema";
import { SwipeCard } from "../cards/swipe-card";
import { AnimatePresence } from "framer-motion";
import { Heart, X, User2, Bell, Undo, Star, Trophy } from "lucide-react";
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
import { FeedbackModal } from "@/components/shared/feedback-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import Link from "next/link";

interface ExploreMobileV2Props {
  initialProfiles: Profile[];
  currentUserProfile: Profile;
  currentUser: { id: string; image: string; name: string; email: string };
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
          (profile: Profile) =>
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
                  <div className="absolute -bottom-20 left-0 right-0 flex justify-center items-center gap-6 z-10">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-16 w-16 rounded-full border-none shadow-xl bg-white hover:bg-white/90 dark:bg-background dark:hover:bg-background/90 backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                      onClick={() => handleSwipe("left")}
                      disabled={isAnimating}
                      style={{
                        boxShadow: "0 10px 25px rgba(239, 68, 68, 0.2)",
                        border: "2px solid rgb(239, 68, 68)",
                      }}
                    >
                      <X className="h-8 w-8 text-red-500" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 rounded-full border-none shadow-xl bg-white hover:bg-white/90 dark:bg-background dark:hover:bg-background/90 backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                      onClick={handleRevert}
                      disabled={swipedProfiles.length === 0 || isAnimating}
                      style={{
                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                        border: "2px solid rgb(59, 130, 246)",
                      }}
                    >
                      <Undo className="h-6 w-6 text-blue-500" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-16 w-16 rounded-full border-none shadow-xl bg-white hover:bg-white/90 dark:bg-background dark:hover:bg-background/90 backdrop-blur-sm hover:scale-110 transition-transform duration-200"
                      onClick={() => handleSwipe("right")}
                      disabled={isAnimating}
                      style={{
                        boxShadow: "0 10px 25px rgba(236, 72, 153, 0.2)",
                        border: "2px solid rgb(236, 72, 153)",
                      }}
                    >
                      <Heart className="h-8 w-8 text-pink-500" />
                    </Button>
                  </div>
                </SwipeCard>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background border-t border-border">
            <div className="flex items-center justify-around p-4">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full h-12 w-12"
              >
                <Link href="/leaderboard">
                  <Trophy className="h-6 w-6 text-pink-500" />
                </Link>
              </Button>

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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-accent/50 transition-colors duration-200"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200">
                      <AvatarImage
                        src={currentUser?.image || undefined}
                        alt={currentUser?.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white">
                        {currentUser?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 backdrop-blur-lg bg-white/90 dark:bg-gray-950/90 border border-border/50 shadow-lg shadow-primary/5"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 rounded-md hover:bg-accent/80 transition-colors duration-200"
                    >
                      <User2 className="mr-2 h-4 w-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors duration-200 mt-1"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <FeedbackModal />

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
