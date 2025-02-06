"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/db/schema";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewMoreProfile } from "./view-more-profile";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

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
              {likedByProfiles.length > 0 && (
                <span className="bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {likedByProfiles.length}
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
              {profiles.length > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {profiles.length}
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
                {likedByProfiles.map((profile) => (
                  <motion.div
                    key={`liked-by-${profile.userId}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="group relative bg-white dark:bg-background rounded-xl p-3 mb-3 shadow-sm border border-pink-100 dark:border-pink-900 hover:border-pink-300 dark:hover:border-pink-700 transition-all cursor-pointer"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-pink-200 dark:border-pink-800">
                          <AvatarImage
                            src={profile.profilePhoto || profile.photos?.[0]}
                            width={56}
                            height={56}
                            alt={`${profile.firstName}'s photo`}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">
                            {profile.firstName?.[0]}
                            {profile.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -right-1 -bottom-1 text-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          💝
                        </motion.div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base">
                          {profile.firstName}, {profile.age}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.course}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setIsProcessing(true);
                            await onLikeBack(profile.userId);
                            setIsProcessing(false);
                          }}
                          disabled={isProcessing}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-100/50 dark:hover:bg-pink-950/50 text-pink-500 dark:text-pink-400"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setIsProcessing(true);
                            await onUnlike(profile.userId);
                            setIsProcessing(false);
                          }}
                          disabled={isProcessing}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100/50 dark:hover:bg-rose-950/50 text-rose-500 dark:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <WhatsAppButton
                          phoneNumber={profile.phoneNumber || ""}
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {likedByProfiles.length === 0 && (
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
                {profiles.map((profile) => (
                  <motion.div
                    key={`matched-with-${profile.userId}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="group relative bg-white dark:bg-background rounded-xl p-3 mb-3 shadow-sm border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-purple-200 dark:border-purple-800">
                          <AvatarImage
                            src={profile.profilePhoto || profile.photos?.[0]}
                            width={56}
                            height={56}
                            alt={`${profile.firstName}'s photo`}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                            {profile.firstName?.[0]}
                            {profile.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          className="absolute -right-1 -bottom-1 text-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          ✨
                        </motion.div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-base">
                          {profile.firstName}, {profile.age}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {profile.course}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setIsProcessing(true);
                            await onLikeBack(profile.userId);
                            setIsProcessing(false);
                          }}
                          disabled={isProcessing}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-100/50 dark:hover:bg-pink-950/50 text-pink-500 dark:text-pink-400"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            setIsProcessing(true);
                            await onUnlike(profile.userId);
                            setIsProcessing(false);
                          }}
                          disabled={isProcessing}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-100/50 dark:hover:bg-rose-950/50 text-rose-500 dark:text-rose-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <WhatsAppButton
                          phoneNumber={profile.phoneNumber || ""}
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}

                {profiles.length === 0 && (
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
