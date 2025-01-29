"use client";

import { Dialog } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Profile } from "@/db/schema";

interface MatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedProfile: Profile;
  children?: React.ReactNode;
}

export function MatchModal({
  open,
  onOpenChange,
  matchedProfile,
}: MatchModalProps) {
  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff69b4", "#ff85c8", "#ffa1dc"],
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white dark:bg-background rounded-3xl p-8 max-w-md w-full mx-4 text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">💘</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
              It&apos;s a Match 💝
            </h2>
            <p className="text-lg text-muted-foreground">
              Sparks are flying ✨ Time to make a move bestie
            </p>
          </div>

          <div className="flex justify-center">
            <WhatsAppButton
              phoneNumber={matchedProfile.phoneNumber || ""}
              className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
            />
          </div>
        </div>
      </motion.div>
    </Dialog>
  );
}
