"use client";

import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import type { Profile } from "@/db/schema";
import { useState } from "react";
import { MobileCrushesModal } from "./mobile-crushes-modal";
import { MobileMatchesModal } from "./mobile-matches-modal";
import { ShareAppModal } from "@/components/shared/share-app";
import { NotifyMobile } from "../modals/notify-mobile";
import { ProfileDetails } from "./profile-details";

interface EmptyMobileViewProps {
  likedProfiles: Profile[];
  onShare: () => void;
  onUnlike: (profileId: string) => void;
  currentUser: { id: string };
}

export function EmptyMobileView({
  likedProfiles,
  onShare,
  onUnlike,
  currentUser,
}: EmptyMobileViewProps) {
  const [crushesOpen, setCrushesOpen] = useState(false);
  const [matchesOpen, setMatchesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const matchedProfiles = likedProfiles.filter((p) => p.isMatch);
  const crushProfiles = likedProfiles.filter((p) => !p.isMatch);

  const handleShare = () => {
    setShareOpen(true);
    onShare();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gradient-to-b from-pink-50/30 to-white dark:from-pink-950/30 dark:to-background">
      <NotifyMobile />
      {/* Top Section with Stats */}
      <div className="flex justify-between px-4 py-3 border-b border-pink-100 dark:border-pink-900">
        <button
          onClick={() => setCrushesOpen(true)}
          className="flex-1 mx-2 py-2 px-4 rounded-xl bg-white/50 dark:bg-background/50 border border-pink-100 dark:border-pink-900 hover:bg-pink-50/50 dark:hover:bg-pink-950/50 transition-colors group"
        >
          <div className="text-center space-y-1">
            <span className="text-xs text-muted-foreground group-hover:text-pink-600 transition-colors">
              Crushes
            </span>
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-semibold text-pink-600">
                {crushProfiles.length}
              </p>
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                💖
              </span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMatchesOpen(true)}
          className="flex-1 mx-2 py-2 px-4 rounded-xl bg-white/50 dark:bg-background/50 border border-purple-100 dark:border-purple-900 hover:bg-purple-50/50 dark:hover:bg-purple-950/50 transition-colors group"
        >
          <div className="text-center space-y-1">
            <span className="text-xs text-muted-foreground group-hover:text-purple-600 transition-colors">
              Matches
            </span>
            <div className="flex items-center justify-center gap-1">
              <p className="text-lg font-semibold text-purple-600">
                {matchedProfiles.length}
              </p>
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                💘
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 flex flex-col justify-center items-center space-y-6">
        {/* Emoji Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <span className="text-6xl">✨</span>
          <motion.span
            className="absolute -top-4 -right-4 text-4xl"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            💝
          </motion.span>
        </motion.div>

        {/* Message */}
        <div className="text-center space-y-2 px-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            All Caught Up 🎉,Reload to view again
          </h2>
          <p className="text-sm text-muted-foreground">
            No more profiles to show right now... Share StrathSpace to find more
            people to crush on and stand a chance to win our valentines Day
            exclusive gift 💝
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3 w-full px-4">
          <div className="p-3 rounded-xl bg-white/50 dark:bg-background/50 shadow-sm">
            <div className="text-xl mb-1">🔥</div>
            <div className="text-xs font-medium">Keep Swiping</div>
            <div className="text-[10px] text-muted-foreground">
              New people join daily
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/50 dark:bg-background/50 shadow-sm">
            <div className="text-xl mb-1">💫</div>
            <div className="text-xs font-medium">Share App</div>
            <div className="text-[10px] text-muted-foreground">
              Invite your besties
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section with Profiles */}
      <div className="border-t border-pink-100 dark:border-pink-900 p-4 space-y-4">
        {/* Horizontal scroll for liked profiles */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {likedProfiles.map((profile) => (
              <ProfileDetails
                key={profile.userId}
                profile={profile}
                isMatch={profile.isMatch ?? false}
                trigger={
                  <div className="flex-shrink-0 relative group cursor-pointer">
                    <Avatar className="h-12 w-12 border-2 border-pink-200 dark:border-pink-800 transition-transform group-hover:scale-105">
                      <AvatarImage src={profile.profilePhoto || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white text-xs">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {profile.isMatch && (
                      <span className="absolute -top-1 -right-1 text-sm">
                        💘
                      </span>
                    )}
                    <div className="absolute inset-0 rounded-full bg-pink-500/10 dark:bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                }
                isMobileSheet={true}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md text-sm py-2"
        >
          <Share className="mr-2 h-3 w-3" />
          Share StrathSpace
        </Button>
      </div>

      <MobileCrushesModal
        isOpen={crushesOpen}
        onClose={() => setCrushesOpen(false)}
        profiles={likedProfiles}
        onUnlike={onUnlike}
      />
      <MobileMatchesModal
        isOpen={matchesOpen}
        onClose={() => setMatchesOpen(false)}
        profiles={likedProfiles}
        currentUser={currentUser}
      />
      <ShareAppModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
