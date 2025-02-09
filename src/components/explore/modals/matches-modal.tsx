"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import {  AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatWindow } from '@/components/chat/chat-window';

interface MatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Profile[];
  currentUser: { id: string };
}

export function MatchesModal({
  isOpen,
  onClose,
  matches,
   currentUser,
}: MatchesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
              Your Matches
            </span>
            <span className="absolute -right-7 -top-1 text-xl">💘</span>
          </div>
          <span className="text-purple-500 text-sm font-medium">
            {matches.length}
          </span>
        </div>
        <ScrollArea className="h-[60vh]">
          <div className="space-y-4">
            <AnimatePresence>
              {matches.map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar>
                      <AvatarImage src={match.profilePhoto || ""} />
                      <AvatarFallback>{match.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{match.firstName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Matched {new Date(match.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChatWindow
                    matchId={match.id}
                    recipient={match}
                    currentUserId={currentUser.id}
                    initialMessages={match.messages || []}

                  />

                </div>
              ))}
            </AnimatePresence>

            {matches.length === 0 && (
              <EmptyState
                icon="💝"
                title="No matches yet"
                description="Keep swiping to find your perfect match!"
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
