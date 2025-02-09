"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import Image from "next/image";
import { useCallback, useState } from "react";
import { ChatWindow } from "@/components/chat/chat-window";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedProfile: Profile;
  currentUserProfile: Profile;
  currentUser: { id: string };
  children?: React.ReactNode;
}

export function MatchModal({
  isOpen,
  onClose,
  matchedProfile,
  currentUserProfile,
}: MatchModalProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const fire = useCallback(confetti, []);

  // Early return if no matched profile
  if (!matchedProfile || !currentUserProfile) {
    return null;
  }

  const triggerConfetti = () => {
    fire({
      particleCount: 100,
      spread: 26,
      startVelocity: 55,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire({
      particleCount: 150,
      spread: 60,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire({
      particleCount: 150,
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire({
      particleCount: 50,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-md mx-auto bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl"
          onOpenAutoFocus={() => triggerConfetti()}
        >
          <DialogTitle className="sr-only">Match Confirmation</DialogTitle>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Profile Pictures */}
                <div className="relative flex justify-center items-center gap-4">
                  {/* Current User Photo */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-pink-200 dark:ring-pink-800">
                      <Image
                        src={
                          currentUserProfile?.profilePhoto ||
                          currentUserProfile?.photos?.[0] ||
                          "/default-avatar.png" // Add a default avatar
                        }
                        alt="Your photo"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-2 -right-2 text-2xl"
                    >
                      ✨
                    </motion.div>
                  </motion.div>

                  {/* Heart Animation */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute top-1/2 -translate-y-1/2 z-10 text-4xl"
                  >
                    💘
                  </motion.div>

                  {/* Matched Profile Photo */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-pink-200 dark:ring-pink-800">
                      <Image
                        src={
                          matchedProfile?.profilePhoto ||
                          matchedProfile?.photos?.[0] ||
                          "/default-avatar.png" // Add a default avatar
                        }
                        alt={`${matchedProfile?.firstName || "Match"}'s photo`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-2 -left-2 text-2xl"
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                </div>

                {/* Match Text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 text-center"
                >
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    It&apos;s a Match! 💝
                  </h2>
                  <p className="text-muted-foreground">
                    You and {matchedProfile?.firstName || "your match"} liked
                    each other
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8"
                >
                  <Button
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                    size="lg"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    Chat Now
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Separate Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex items-center gap-4 mb-4 p-4 border-b">
            <Avatar>
              <AvatarImage src={matchedProfile.profilePhoto || ""} />
              <AvatarFallback>{matchedProfile.firstName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{matchedProfile.firstName}</h3>
              <p className="text-sm text-muted-foreground">
                {matchedProfile.bio?.substring(0, 50)}...
              </p>
            </div>
          </div>

          <ChatWindow
            matchId={matchedProfile.id}
            recipient={matchedProfile}
            currentUserId={currentUserProfile.id}
            initialMessages={[]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
