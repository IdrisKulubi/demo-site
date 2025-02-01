"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MatchCard } from "../cards/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { handleLike, handleUnlike } from "@/lib/actions/like.actions";

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: Profile[];
  onUpdate?: () => void;
  onUnlike: (userId: string) => Promise<{ success: boolean }>;
}

export function LikesModal({
  isOpen,
  onClose,
  likes,
  onUpdate,
}: LikesModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string>("");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Reset removedIds when modal reopens
  useEffect(() => {
    if (!isOpen) {
      setRemovedIds(new Set());
    }
  }, [isOpen]);

  const handleLikeBack = async (userId: string) => {
    try {
      setIsProcessing(userId);
      const result = await handleLike(userId);

      if (result.success) {
        // Remove from likes list immediately
        setRemovedIds((prev) => new Set([...prev, userId]));

        if (result.isMatch) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          toast({
            title: "It's a match! ✨",
            description: "You can now chat with each other!",
          });
        }

        // Update parent components to refresh the likes list
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to like back", error);
      toast({
        title: "Oops! 🙈",
        description: "Something went wrong while liking back. Try again!",
        variant: "destructive",
      });
    } finally {
      setIsProcessing("");
    }
  };

  const handleUnlikeAction = async (userId: string) => {
    try {
      setIsProcessing(userId);
      const result = await handleUnlike(userId);

      if (result.success) {
        // Remove from likes list immediately
        setRemovedIds((prev) => new Set([...prev, userId]));

        toast({
          title: "Slay bestie 💅",
          description: "They're gone faster than my motivation on Mondays",
        });

        // Update parent components to refresh the likes list
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to unlike", error);
      toast({
        title: "Whoopsie 🙈",
        description:
          "That didn't work bestie, maybe it's a sign? jk try again!",
        variant: "destructive",
      });
    } finally {
      setIsProcessing("");
    }
  };

  // Filter out removed and duplicate profiles
  const visibleLikes = [
    ...new Map(
      likes
        .filter((profile) => !removedIds.has(profile.userId))
        .map((profile) => [profile.userId, profile])
    ).values(),
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setRemovedIds(new Set());
        }
        onClose();
      }}
    >
      <DialogContent className="max-w-md p-4">
        <h2 className="text-2xl font-bold mb-4">
          People who liked you
          <span className="text-base font-normal text-muted-foreground ml-2">
            {visibleLikes.length > 0 ? "✨ go bestie!" : ""}
          </span>
        </h2>
        <ScrollArea className="h-[60vh]">
          {visibleLikes.length > 0 ? (
            <div className="space-y-4">
              {visibleLikes.map((profile) => (
                <MatchCard
                  key={`like-${profile.userId}-${
                    profile.createdAt.getTime() ?? Date.now()
                  }`}
                  profile={profile}
                  onLikeBack={handleLikeBack}
                  onUnlike={handleUnlikeAction}
                  isProcessing={isProcessing === profile.userId}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="✨"
              title="No likes yet bestie"
              description="Keep that profile glowing! Your future matches are loading... 💫"
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
