"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/db/schema";
import { ViewMoreCrush } from "./view-more-crush";
import { useState } from "react";

interface SidePanelsProps {
  profiles: Profile[];
  likedByProfiles: Profile[];
  onUnlike: (profileId: string) => void;
  onLikeBack: (profileId: string) => void;
}

export function SidePanels({
  profiles,
  likedByProfiles,
  onUnlike,
  onLikeBack,
}: SidePanelsProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const matchedProfiles = profiles.filter((p) => p.isMatch);
  const crushProfiles = profiles.filter((p) => !p.isMatch);

  return (
    <div className="hidden lg:flex flex-col gap-4 h-[calc(100vh-6rem)] w-full">
      {/* Liked By Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 min-h-0 bg-white/50 dark:bg-background/50 rounded-2xl p-4 border border-pink-100 dark:border-pink-900 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-pink-500">
            Likes You{" "}
            {likedByProfiles.length > 0 && `(${likedByProfiles.length})`}
          </h2>
          <span className="text-xl">💘</span>
        </div>
        <ScrollArea className="h-[calc(33vh-8rem)] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {likedByProfiles.map((profile) => (
                <motion.div
                  key={profile.userId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="group relative bg-white dark:bg-background rounded-xl p-3 shadow-sm border border-pink-100 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-pink-200 dark:border-pink-800">
                      <AvatarImage
                        src={profile.profilePhoto || profile.photos?.[0]}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.course} • Year {profile.yearOfStudy}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-pink-600 hover:text-pink-700 hover:bg-pink-100/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeBack(profile.userId);
                      }}
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {likedByProfiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-pink-400/80 space-y-2"
              >
                <div className="text-4xl mb-3">💘</div>
                <p className="text-sm font-medium">No likes yet</p>
                <p className="text-xs text-muted-foreground">
                  Keep your profile active to get more likes! 💖
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Matches Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 min-h-0 bg-white/50 dark:bg-background/50 rounded-2xl p-4 border border-purple-100 dark:border-purple-900 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-purple-500">
            Your Matches{" "}
            {matchedProfiles.length > 0 && `(${matchedProfiles.length})`}
          </h2>
          <span className="text-xl">✨</span>
        </div>
        <ScrollArea className="h-[calc(33vh-8rem)] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {matchedProfiles.map((profile) => (
                <motion.div
                  key={profile.userId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="group relative bg-white dark:bg-background rounded-xl p-3 shadow-sm border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
                      <AvatarImage
                        src={profile.profilePhoto || profile.photos?.[0]}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.course} • Year {profile.yearOfStudy}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {matchedProfiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-purple-400/80 space-y-2"
              >
                <div className="text-4xl mb-3">💫</div>
                <p className="text-sm font-medium">No matches yet</p>
                <p className="text-xs text-muted-foreground">
                  Keep swiping to find your perfect match! ✨
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Crushes Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 min-h-0 bg-white/50 dark:bg-background/50 rounded-2xl p-4 border border-pink-100 dark:border-pink-900 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-pink-500">
            Your Crushes{" "}
            {crushProfiles.length > 0 && `(${crushProfiles.length})`}
          </h2>
          <span className="text-xl">💝</span>
        </div>
        <ScrollArea className="h-[calc(33vh-8rem)] pr-4">
          <div className="space-y-3">
            <AnimatePresence>
              {crushProfiles.map((profile) => (
                <motion.div
                  key={profile.userId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="group relative bg-white dark:bg-background rounded-xl p-3 shadow-sm border border-pink-100 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-pink-200 dark:border-pink-800">
                      <AvatarImage
                        src={profile.profilePhoto || profile.photos?.[0]}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {profile.course} • Year {profile.yearOfStudy}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-pink-600 hover:text-pink-700 hover:bg-pink-100/50"
                      onClick={() => onUnlike(profile.userId)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {crushProfiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-pink-400/80 space-y-2"
              >
                <div className="text-4xl mb-3">💝</div>
                <p className="text-sm font-medium">No crushes yet</p>
                <p className="text-xs text-muted-foreground">
                  Start swiping to find your match! 💖
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {selectedProfile && (
        <ViewMoreCrush
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLikeBack={onLikeBack}
        />
      )}
    </div>
  );
}
