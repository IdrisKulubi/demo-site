"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useImageReminder } from "@/hooks/use-image-reminder";

export function ImageReminder() {
  const { isOpen, setIsOpen, hasEnoughImages } = useImageReminder();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md rounded-2xl border-0 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950 dark:to-background">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="text-6xl">📸✨</div>
            </div>
            <DialogTitle className="text-center text-2xl font-bold">
              {hasEnoughImages
                ? "Up Your Selfie Game! 💅"
                : "No Photos? No Swipes! 😱"}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="text-center mt-4 space-y-4">
            <p className="text-lg">
              {hasEnoughImages
                ? "Your current pics are cute but... we know you've got better ones! Add more to boost your matches by 300% 🚀"
                : "Can't start swiping without at least 3 fire photos! Time to show off your best angles bestie 😏"}
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                asChild
                variant="gradient"
                className="rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:scale-105 transition-transform"
              >
                <Link href="/profile/setup">
                  {hasEnoughImages ? "Add More Pics" : "Fix My Profile"}
                  <span className="ml-2">👉</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="rounded-full px-6 py-6 text-lg font-medium hover:bg-pink-100/50 dark:hover:bg-pink-900/20"
              >
                Maybe Later 😴
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              {hasEnoughImages
                ? "Pro tip: Include pics with your pet 🐶 or hobby 🎸"
                : "Don't be shy, we've seen worse! 😜"}
            </p>
          </DialogDescription>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
