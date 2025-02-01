"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/actions/feedback.actions";
import confetti from "canvas-confetti";

export function ReliefNotifyModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Bruh... 🥲",
        description: "Type something before sending! I'm not a mind reader",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(
        message,
        name || undefined,
        phoneNumber || undefined
      );
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      toast({
        title: "Message yeeted! 🎯",
        description: "I felt that through the screen fr fr",
      });

      setMessage("");
      setName("");
      setPhoneNumber("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[999] p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-gradient-to-br from-pink-100/90 to-purple-100/90 dark:from-pink-900/80 dark:to-purple-900/80 p-4 sm:p-6 rounded-2xl border-2 border-pink-200 dark:border-pink-800 backdrop-blur-xl w-[95%] sm:w-[400px] max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1 hover:bg-pink-100/50 dark:hover:bg-pink-900/50 rounded-full transition-colors"
            >
              <span className="text-2xl">❌</span>
            </button>

            <div className="space-y-3">
              {/* Header Section */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-3xl sm:text-4xl"
                >
                  🤦♂️🐛
                </motion.span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Big Oof Alert! 🚨
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    That bug trolled me for 6 hours fr 😭
                  </p>
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2 sm:space-y-3 text-xs sm:text-sm"
              >
                <div className="p-3 bg-pink-50/30 dark:bg-pink-900/20 rounded-lg">
                  <p className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-xl">💻</span>
                    Me coding: &quot;This makes no sense!&quot;
                    <br />
                    <span className="text-xl">😇</span>
                    The solution: Literally one line fix
                  </p>
                </div>

                <div className="p-3 bg-purple-50/30 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-center font-medium">
                    🎭 Face reveal at 1k matches! Currently manifesting... 🤞
                  </p>
                </div>

                <p className="text-center">
                  Drop a message below! Whether you want to:
                  <br />
                  🎮 Request new features
                  <br />
                  💭 Share your thoughts
                  <br />
                  👋 Or just say hi!
                </p>

                <div className="p-3 bg-purple-50/30 dark:bg-purple-900/20 rounded-lg">
                  <p className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-xl">💸</span>
                    Chat feature? Would if I could, It&apos;s abit pricey
                    <br />
                    <span className="animate-bounce text-xl">🤑</span>
                    Pray I win the lottery tonight? 🙏
                  </p>
                </div>
              </motion.div>

              {/* Feedback Form */}
              <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-1.5 sm:p-2 text-sm rounded-lg border border-pink-200 dark:border-pink-800 bg-white/50 dark:bg-black/20"
                />
                <input
                  type="tel"
                  placeholder="Your digits 📱"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-1.5 sm:p-2 text-sm rounded-lg border border-pink-200 dark:border-pink-800 bg-white/50 dark:bg-black/20"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Roast my code or drop suggestions 🔥"
                  className="w-full p-1.5 sm:p-2 text-sm rounded-lg border border-pink-200 dark:border-pink-800 bg-white/50 dark:bg-black/20 h-24"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white p-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Sending...
                    </span>
                  ) : (
                    "Yeet Message 🚀"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
