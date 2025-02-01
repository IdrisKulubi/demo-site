"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Image from "next/image";

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
  // Trigger confetti when modal opens
  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 999999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire(0.2, {
      spread: 60,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onAnimationComplete={triggerConfetti}
              className="p-6 text-center"
            >
              {/* Photos Section */}
              <div className="relative flex justify-center gap-4 mb-8">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-pink-200 dark:ring-pink-800">
                    <Image
                      src={
                        currentUserProfile.profilePhoto ||
                        currentUserProfile.photos?.[0] ||
                        ""
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

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-pink-200 dark:ring-pink-800">
                    <Image
                      src={
                        matchedProfile.profilePhoto ||
                        matchedProfile.photos?.[0] ||
                        ""
                      }
                      alt={`${matchedProfile.firstName}'s photo`}
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
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  It&apos;s a Match 💝
                </h2>
                <p className="text-muted-foreground">
                  You and {matchedProfile.firstName} liked each other
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 space-y-3"
              >
                <Link
                  href={`/messages/${matchedProfile.userId}`}
                  className="block"
                >
                  <Button
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send a Message
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={onClose}
                >
                  Keep Swiping
                  <Heart className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
