"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Profile } from "@/db/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProfileDetails } from "@/components/explore/cards/profile-details";
import { ViewMoreCrush } from "./view-more-crush";

interface LikedPanelProps {
  profiles: Profile[];
  likedByProfiles: Profile[];
  onUnlike: (profileId: string) => void;
  onLikeBack: (profileId: string) => void;
}

export function LikedPanel({
  profiles,
  likedByProfiles,
  onUnlike,
  onLikeBack,
}: LikedPanelProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const crushProfiles = profiles.filter((profile) => !profile.isMatch);

  return (
    <motion.div
      className="fixed left-4 top-24 bg-white/80 dark:bg-background/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-pink-100 dark:border-pink-950 z-50 w-72"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Profiles that liked you */}
      {likedByProfiles.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-pink-500">
              Likes You{" "}
              {likedByProfiles.length > 0 && `(${likedByProfiles.length})`}
            </h2>
          </div>
          <ScrollArea className="h-[120px] pr-2">
            <div className="space-y-2">
              {likedByProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  className="group relative bg-white dark:bg-background rounded-2xl p-3 shadow-sm border border-pink-100 dark:border-pink-900 flex items-center gap-3 cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  <Avatar>
                    <AvatarImage
                      src={profile.photos?.[0]}
                      width={40}
                      height={40}
                      alt={`${profile.firstName}'s photo`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">
                      {profile.firstName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile.firstName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.course}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Your existing crushes section */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-pink-500">
          Your Crushes {crushProfiles.length > 0 && `(${crushProfiles.length})`}
        </h2>
      </div>
      <ScrollArea className="h-[min(30vh,200px)] pr-2">
        <div className="space-y-2">
          {crushProfiles.map((profile) => (
            <ProfileDetails
              key={profile.id}
              profile={profile}
              trigger={
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-white dark:bg-background rounded-2xl p-3 shadow-sm border border-pink-100 dark:border-pink-900 flex items-center gap-3 cursor-pointer"
                >
                  <Avatar className="h-12 w-12 border-2 border-pink-200 dark:border-pink-800">
                    <AvatarImage
                      src={profile.profilePhoto || ""}
                      width={48}
                      height={48}
                      alt={`${profile.firstName}'s photo`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">
                      {profile.firstName?.[0]}
                      {profile.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.course}, Year {profile.yearOfStudy}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlike(profile.userId);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              }
            />
          ))}

          {crushProfiles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 text-pink-400/80 space-y-2"
            >
              <div className="text-4xl mb-3">💝</div>
              <p className="text-sm font-medium">No crushes yet</p>
              <p className="text-xs text-muted-foreground">
                Start swiping to find your match!
              </p>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* View More Modal for profiles that liked you */}
      {selectedProfile && (
        <ViewMoreCrush
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLikeBack={onLikeBack}
        />
      )}
    </motion.div>
  );
}
