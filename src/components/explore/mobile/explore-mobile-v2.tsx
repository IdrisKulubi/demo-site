"use client";

import { useState, useCallback, useEffect } from "react";
import { Profile } from "@/db/schema";
import { SwipeableCard } from "../cards/swipeable-card";
import { AnimatePresence } from "framer-motion";
import { Heart, User2, Star } from "lucide-react";
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
import confetti from "canvas-confetti";
import { SwipeControls } from "../controls/swipe-controls";

interface ExploreMobileV2Props {
  initialProfiles: Profile[];
  currentUserProfile: Profile;
  currentUser: { id: string; image: string; name: string };
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLikeBack = async (userId: string) => {
    try {
      const result = await handleLike(userId);
      if (result.success) {
        // Remove from likes immediately
        setLikes((prev) => prev.filter((profile) => profile.userId !== userId));

        if (result.isMatch && result.matchedProfile) {
          // Add to matches immediately
          setMatches((prev) => {
            // Avoid duplicate matches
            if (prev.some((p) => p.userId === result.matchedProfile!.userId)) {
              return prev;
            }
            return [...prev, result.matchedProfile!];
          });

          // Show match modal with the matched profile
          setMatchedProfile(result.matchedProfile);

          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          toast({
            title: "It's a match! ✨",
            description: "You can now chat with each other!",
            className:
              "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-none",
          });
        }

        // Sync with server to ensure consistency
        await syncMatchesAndLikes();
      }
      return result;
    } catch (error) {
      console.error("Error in handleLikeBack:", error);
      toast({
        title: "Oops! 🙈",
        description: "Something went wrong while matching. Try again!",
        variant: "destructive",
      });
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
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {profiles.length > 0 ? (
        <>
          <div className="relative w-[calc(100%-32px)] mx-auto h-[calc(100vh-5rem)]">
            <AnimatePresence>
              {profiles[currentIndex] && (
                <>
                  <SwipeableCard
                    key={profiles[currentIndex].userId}
                    profile={
                      profiles[currentIndex] as Profile & { photos?: string[] }
                    }
                    onSwipe={handleSwipe}
                    active={true}
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Swipe Controls - Fixed at bottom */}
          <div className="fixed bottom-12 left-0 right-0 px-4 pb-4 z-50">
            <SwipeControls
              onSwipeLeft={() => handleSwipe("left")}
              onSwipeRight={() => handleSwipe("right")}
              onUndo={handleRevert}
              onSuperLike={() => {
                toast({
                  title: "bestie wait ⭐️✨",
                  description:
                    "super likes coming soon & they're gonna be lit fr fr 🔥",
                  className:
                    "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-none",
                });
              }}
              disabled={isAnimating || currentIndex < 0}
              className="mx-auto max-w-lg"
            />
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/50">
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
