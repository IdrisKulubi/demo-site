"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/db/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
  const crushProfiles = profiles.filter((p) => !p.isMatch);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] px-0">
        <SheetHeader className="px-4 mb-6">
          <SheetTitle className="flex items-center justify-between">
            <div className="relative">
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                Your Crushes
              </span>
              <span className="absolute -right-7 -top-1 text-xl">💖</span>
            </div>
            <span className="text-pink-500 text-sm font-medium">
              {crushProfiles.length}
            </span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(80vh-8rem)] px-4">
          <div className="space-y-4">
            <AnimatePresence>
              {crushProfiles.map((profile) => (
                <motion.div
                  key={profile.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-3 bg-white/50 dark:bg-background/50 p-3 rounded-2xl border border-pink-100 dark:border-pink-900"
                >
                  <Avatar className="h-14 w-14 border-2 border-pink-200 dark:border-pink-800">
                    <AvatarImage src={profile.profilePhoto || ""} />
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
                      {profile.course} • {profile.yearOfStudy}
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
                </motion.div>
              ))}
            </AnimatePresence>

            {crushProfiles.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-pink-400/80 space-y-3"
              >
                <div className="text-5xl mb-4">💝</div>
                <p className="text-base font-medium">No crushes yet</p>
                <p className="text-sm text-muted-foreground">
                  Start swiping to find your match!
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
