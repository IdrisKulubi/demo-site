"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {  Heart } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Image from "next/image";
import { useCallback } from "react";

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

  // Format WhatsApp message with null checks and proper encoding
  const whatsappMessage = encodeURIComponent(
    `Hey ${matchedProfile?.firstName || "there"}! We matched on StrathSpace! 💖`
  ).replace(/[!'()]/g, escape); // Extra encoding for special characters

  // Format phone number for WhatsApp
  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return null;

    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, "");

    // Add Kenya country code if not present
    if (digits.startsWith("0")) {
      return `254${digits.substring(1)}`;
    }

    // If number starts with 254, use as is
    if (digits.startsWith("254")) {
      return digits;
    }

    // If number starts with 7 or 1, add 254
    if (digits.startsWith("7") || digits.startsWith("1")) {
      return `254${digits}`;
    }

    return digits;
  };

  const formattedPhone = formatPhoneNumber(matchedProfile?.phoneNumber);

  // Construct WhatsApp URL with properly encoded parameters
  const whatsappLink = formattedPhone
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${whatsappMessage}`
    : "#";

  return (
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
                  You and {matchedProfile?.firstName || "your match"} liked each
                  other
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 space-y-3"
              >
                {formattedPhone ? (
                  <Link href={whatsappLink} target="_blank" className="block">
                    <Button
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                      size="lg"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Message on WhatsApp
                    </Button>
                  </Link>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Phone number not available
                  </p>
                )}

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
