"use client";

import { Dialog, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, GraduationCap, Instagram, Music } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ViewMoreProfileProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
}

export function ViewMoreProfile({
  profile,
  isOpen,
  onClose,
  onLike,
}: ViewMoreProfileProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle>{profile.firstName}</DialogTitle>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 overflow-hidden">
            <Image
              src={
                profile.photos?.[0] ||
                profile.profilePhoto ||
                "/default-avatar.png"
              }
              alt={`${profile.firstName}'s photo`}
              className="w-full h-full object-cover"
              width={600}
              height={300}
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </div>

          {/* Profile Content */}
          <ScrollArea className="px-6 pb-6 max-h-[60vh]">
            <div className="space-y-4 -mt-12 relative">
              {/* Profile Info */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {profile.firstName}, {profile.age}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span>
                    {profile.course}, Year {profile.yearOfStudy}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-300 text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Links */}
              <div className="flex gap-3 pt-2">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {profile.spotify && (
                  <a
                    href={profile.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-600"
                  >
                    <Music className="h-5 w-5" />
                  </a>
                )}
              </div>

              {/* Like Button */}
              <motion.div className="pt-4">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                  onClick={onLike}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like {profile.firstName}
                </Button>
              </motion.div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
