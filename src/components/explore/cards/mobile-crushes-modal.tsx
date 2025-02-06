"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/db/schema";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileCrushesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  onUnlike: (profileId: string) => void;
}

export function MobileCrushesModal({
  isOpen,
  onClose,
  profiles,
  onUnlike,
}: MobileCrushesModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 space-y-4 border-b border-pink-100 dark:border-pink-900 bg-gradient-to-b from-pink-50/50 to-white dark:from-pink-950/50 dark:to-background backdrop-blur-sm">
            <SheetTitle className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              Your Crushes <span className="text-2xl">💝</span>
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              People you&apos;ve liked! They&apos;ll be notified if they like
              you back ✨
            </SheetDescription>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {profiles.map((profile) => (
                  <motion.div
                    key={profile.userId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="group relative bg-gradient-to-br from-white to-pink-50 dark:from-background dark:to-pink-950/20 rounded-xl p-4 border border-pink-100 dark:border-pink-900 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-md duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 ring-2 ring-pink-200 dark:ring-pink-800 ring-offset-2 ring-offset-white dark:ring-offset-background">
                        <AvatarImage
                          src={profile.profilePhoto || ""}
                          alt={`${profile.firstName}'s photo`}
                          width={56}
                          height={56}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">
                          {profile.firstName?.[0]}
                          {profile.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">
                          {profile.firstName} {profile.lastName?.charAt(0)}.
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {profile.bio}
                        </p>
                      </div>
                      {profile.isMatch ? (
                        <div className="text-2xl animate-pulse">💘</div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUnlike(profile.userId)}
                          className="opacity-50 group-hover:opacity-100 transition-opacity duration-300 hover:bg-pink-100/50 dark:hover:bg-pink-950/50"
                          aria-label={`Unlike ${profile.firstName}`}
                        >
                          <X className="h-4 w-4 text-pink-500 dark:text-pink-400" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {profiles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 space-y-6"
                >
                  <div className="text-6xl animate-bounce">💫</div>
                  <div className="space-y-3">
                    <p className="text-xl font-semibold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                      No crushes yet
                    </p>
                    <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                      Start swiping to find your perfect match! ✨
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
