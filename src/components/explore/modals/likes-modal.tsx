"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MatchCard } from "../cards/match-card";
import { EmptyState } from "@/components/ui/empty-state";

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  likes: Profile[];
}

export function LikesModal({ isOpen, onClose, likes }: LikesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-4">
        <h2 className="text-2xl font-bold mb-4">People who liked you</h2>
        <ScrollArea className="h-[60vh]">
          {likes.length > 0 ? (
            <div className="space-y-4">
              {likes.map((profile) => (
                <MatchCard key={profile.userId} profile={profile} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="✨"
              title="No likes yet"
              description="Keep being awesome! Your likes will appear here."
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 