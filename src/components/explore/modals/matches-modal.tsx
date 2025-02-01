"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MatchCard } from "../cards/match-card";
import { EmptyState } from "@/components/ui/empty-state";

interface MatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Profile[];
}

export function MatchesModal({ isOpen, onClose, matches }: MatchesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-4">
        <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
        <ScrollArea className="h-[60vh]">
          {matches.length > 0 ? (
            <div className="space-y-4">
              {matches.map((match) => (
                <MatchCard key={match.userId} profile={match} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="💝"
              title="No matches yet"
              description="Keep swiping to find your perfect match!"
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 