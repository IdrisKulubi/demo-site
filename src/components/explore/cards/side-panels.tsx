"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/db/schema";
import { useState, useEffect } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewMoreProfile } from "./view-more-profile";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { getMatches } from "@/lib/actions/explore.actions";
import Link from "next/link";

interface SidePanelsProps {
  profiles: Profile[];
  likedByProfiles: Profile[];
  onUnlike: (profileId: string) => Promise<void>;
  onLikeBack: (profileId: string) => Promise<void>;
}

export function SidePanels({
  profiles,
  likedByProfiles,
  onUnlike,
  onLikeBack,
}: SidePanelsProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<"likes" | "matches">("likes");
  const [isProcessing, setIsProcessing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [matches, setMatches] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const result = await getMatches();
      if (!result.error) {
        setMatches(result.matches as Profile[]);
      }
    };
    fetchMatches();
  }, []);

  // Deduplicate profiles based on userId
  const uniqueProfiles = profiles.filter((profile, index, self) => 
    index === self.findIndex((p) => p.userId === profile.userId)
  );

  // Deduplicate likedByProfiles based on userId
  const uniqueLikedByProfiles = likedByProfiles.filter((profile, index, self) => 
    index === self.findIndex((p) => p.userId === profile.userId)
  );

  return (
    <div className="hidden lg:block w-[380px] h-[calc(100vh-6rem)]">
      <Tabs
        defaultValue="likes"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "likes" | "matches")}
        className="h-full"
      >
        <TabsList className="w-full grid grid-cols-2 h-12 bg-white/50 dark:bg-background/50 backdrop-blur-sm">
          <TabsTrigger
            value="likes"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/20 data-[state=active]:to-pink-600/20"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Likes You</span>
              {uniqueLikedByProfiles.length > 0 && (
                <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {uniqueLikedByProfiles.length}
                </span>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-purple-600/20"
          >
            <div className="flex items-center gap-2">
              <span>Matches</span>
              {uniqueProfiles.length > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {uniqueProfiles.length}
                </span>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 h-[calc(100%-4rem)]">
          <TabsContent
            value="likes"
            className="h-full m-0 rounded-xl bg-white/50 dark:bg-background/50 backdrop-blur-sm border border-pink-100 dark:border-pink-900"
          >
            <ScrollArea className="h-full p-4">
              <AnimatePresence mode="popLayout">
                {uniqueLikedByProfiles.map((profile) => (
                  <ProfileCard
                    key={`liked-by-${profile.userId}`}
                    profile={profile}
                    variant="likes"
                    onLikeBack={async (profileId) => {
                      setIsProcessing(true);
                      try {
                        await onLikeBack(profileId);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    onUnlike={async (profileId) => {
                      setIsProcessing(true);
                      try {
                        await onUnlike(profileId);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    isProcessing={isProcessing}
                    onClick={() => setSelectedProfile(profile)}
                  />
                ))}
                {uniqueLikedByProfiles.length === 0 && (
                  <EmptyState
                    icon="💝"
                    title="No likes yet"
                    description="Keep your profile active to get more likes! ✨"
                  />
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="matches"
            className="h-full m-0 rounded-xl bg-white/50 dark:bg-background/50 backdrop-blur-sm border border-purple-100 dark:border-purple-900"
          >
            <ScrollArea className="h-full p-4">
              <AnimatePresence mode="popLayout">
                {uniqueProfiles.map((profile) => (
                  <ProfileCard
                    key={`matched-with-${profile.userId}`}
                    profile={profile}
                    variant="matches"
                    onLikeBack={onLikeBack}
                    onUnlike={onUnlike}
                    isProcessing={isProcessing}
                  />
                ))}
                {uniqueProfiles.length === 0 && (
                  <EmptyState
                    icon="✨"
                    title="No matches yet"
                    description="Keep swiping to find your perfect match! 💫"
                  />
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {selectedProfile && (
        <ViewMoreProfile
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLike={() => onLikeBack(selectedProfile.userId)}
        />
      )}
    </div>
  );
}

function ProfileCard({
  profile,
  variant,
  onLikeBack,
  onUnlike,
  isProcessing,
  onClick,
}: {
  profile: Profile;
  variant: "likes" | "matches";
  onLikeBack: (profileId: string) => Promise<void>;
  onUnlike: (profileId: string) => Promise<void>;
  isProcessing: boolean;
  onClick?: () => void;
}) {
  const colors = {
    likes: {
      border: "border-pink-100 dark:border-pink-900",
      hoverBorder: "hover:border-pink-300 dark:hover:border-pink-700",
      avatarBorder: "border-pink-200 dark:border-pink-800",
      emoji: "💝",
    },
    matches: {
      border: "border-purple-100 dark:border-purple-900",
      hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
      avatarBorder: "border-purple-200 dark:border-purple-800",
      emoji: "✨",
    },
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`group relative bg-white dark:bg-background rounded-lg p-2 mb-2 shadow-sm border ${
        colors[variant].border
      } ${colors[variant].hoverBorder} transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <Avatar className={`h-12 w-12 border-2 ${colors[variant].avatarBorder}`}>
            <AvatarImage
              src={profile.profilePhoto || profile.photos?.[0]}
              width={48}
              height={48}
              alt={`${profile.firstName}'s photo`}
            />
            <AvatarFallback className={`text-sm bg-gradient-to-br from-${variant === 'likes' ? 'pink' : 'purple'}-400 to-${variant === 'likes' ? 'pink' : 'purple'}-600 text-white`}>
              {profile.firstName?.[0]}
              {profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <motion.div
            className="absolute -right-1 -bottom-1 text-base"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {colors[variant].emoji}
          </motion.div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">
            {profile.firstName}, {profile.age}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {profile.course}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            asChild
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100/50 dark:hover:bg-blue-950/50 text-blue-500 dark:text-blue-400"
          >
            <Link href={`/chat/${profile.userId}`}>
              <MessageCircle className="h-3 w-3" />
            </Link>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={async (e) => {
              e.stopPropagation();
              await onLikeBack(profile.userId);
            }}
            disabled={isProcessing}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-100/50 dark:hover:bg-pink-950/50 text-pink-500 dark:text-pink-400"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={async (e) => {
              e.stopPropagation();
              await onUnlike(profile.userId);
            }}
            disabled={isProcessing}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100/50 dark:hover:bg-rose-950/50 text-rose-500 dark:text-rose-400"
          >
            <X className="h-3 w-3" />
          </Button>
          <WhatsAppButton
            phoneNumber={profile.phoneNumber || ""}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </motion.div>
  );
}
