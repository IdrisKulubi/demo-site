"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/actions/feedback.actions";
import { createPortal } from "react-dom";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hasUnread, setHasUnread] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Hold up! 🛑",
        description: "Type something before yeeting it my way",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitFeedback(
        message,
        name || undefined,
        phoneNumber || undefined
      );

      if (result.error) throw new Error(result.error);

      toast({
        title: "Feedback sent",
        description: "I'll read this while sipping matcha latte",
      });

      setMessage("");
      setName("");
      setPhoneNumber("");
      setIsOpen(false);
    } catch (error) {
      console.error("RIP feedback:", error);
      console.log(error);
      toast({
        title: "Big oof 😬",
        description: "Feedback got ghosted, try again?",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(true);
          setHasUnread(false);
        }}
        className="relative group"
      >
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Bell className="h-6 w-6 text-pink-500/90 hover:text-pink-500 transition-colors" />
        </motion.div>
        {hasUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-purple-500 rounded-full ring-2 ring-background"
          />
        )}
      </button>

      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 backdrop-blur-3xl bg-white/5"
              style={{
                zIndex: 2147483647,
                isolation: "isolate",
              }}
            />

            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="relative w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-md bg-background/80 backdrop-blur-3xl p-4 sm:p-6 rounded-xl shadow-2xl border border-white/20 z-[2147483647]"
              style={{
                isolation: "isolate",
              }}
              viewport={{ once: true }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-transparent backdrop-blur-[2px]"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />

              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors group z-10"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="space-y-3 sm:space-y-4 relative z-10">
                <motion.div
                  className="flex items-center gap-2 sm:gap-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="text-2xl sm:text-3xl"
                  >
                    🧑💻
                  </motion.div>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Slide into our DM 📩
                    </h2>
                  </motion.div>
                </motion.div>

                <motion.p
                  className="text-muted-foreground text-xs sm:text-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Send me anything - feature requests,
                  <motion.span
                    className="mx-1.5 inline-block"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    🔥
                  </motion.span>
                  hot takes, or feature suggestions.
                </motion.p>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 sm:gap-4"
                  >
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border bg-black/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm ring-offset-background placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/30"
                    />
                    <input
                      type="tel"
                      placeholder="Your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full rounded-md border bg-black/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm ring-offset-background placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/30"
                    />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your genius here..."
                      className="w-full h-24 sm:h-32 p-2.5 sm:p-3 rounded-xl bg-black/20 border border-white/10 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/30 placeholder:text-white/30 resize-none outline-none transition-all text-sm sm:text-base"
                    />
                    <motion.div
                      className="flex justify-end gap-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        onClick={() => setIsOpen(false)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl hover:bg-white/10 transition-colors font-medium text-xs sm:text-sm"
                      >
                        Nah, I&apos;m good
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-xs sm:text-sm hover:shadow-[0_0_20px_rgba(255,65,106,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20"
                          initial={{ x: "100%" }}
                          whileHover={{ x: "-100%" }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative">
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            "Yeet Feedback 🚀"
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>
                </motion.div>

                <motion.p
                  className="text-center text-[10px] sm:text-xs text-white/50 mt-2 sm:mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  PS: No cap, I read every message fr fr
                  <motion.span
                    className="mx-1.5 inline-block"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ��
                  </motion.span>
                </motion.p>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}
