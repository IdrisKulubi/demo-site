"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { ProfilePreviewModal } from "./profile-preview-modal";
import { MessageCircle } from "lucide-react";
import { ChatWindow } from "@/components/chat/chat-window";

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
}: MatchesModalProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null);

  return (
    <>
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
                {matches.map((profile) => (
                  <motion.div
                    key={profile.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white/50 dark:bg-background/50 p-3 rounded-2xl border border-purple-100 dark:border-purple-900 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 border-2 border-purple-200 dark:border-purple-800 transition-transform hover:scale-105">
                        <AvatarImage 
                          src={profile.profilePhoto || undefined} 
                          alt={`${profile.firstName}'s profile photo`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                          {profile.firstName?.[0]}
                          {profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {profile.course} • {profile.yearOfStudy}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMatch(profile);
                      }}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-full transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 text-purple-500" />
                    </button>
                  </motion.div>
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

      <ProfilePreviewModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        profile={selectedProfile}
      />

      <ChatWindow
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        matchId={selectedMatch?.userId || ""}
        recipient={selectedMatch as Profile}
      />
    </>
  );
}
