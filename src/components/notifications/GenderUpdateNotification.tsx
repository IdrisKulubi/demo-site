"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const GenderUpdateNotification = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification immediately on mount
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    console.log("Notification ghosted 👻"); 
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-black/20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-[90vw] sm:max-w-md bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl shadow-2xl p-4 sm:p-6 text-white border-2 border-white/20 relative overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <button
                onClick={handleClose}
                className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors group"
                aria-label="Close notification"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span className="sr-only">Close this slay</span>
              </button>
              
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl sm:text-2xl">🔥</span>
                  <h3 className="text-base sm:text-lg font-bold">Hot Take Alert 🚨</h3>
                  <span className="text-xl sm:text-2xl">✨</span>
                </div>
                
                <p className="text-xs sm:text-sm leading-relaxed">
                  Bestie we see you swiping left like it&apos;s Tinder 🔥 New character arc unlocked: 
                  Now seeing <span className="font-bold">opposite gender only</span> (enby fam gets 
                  the whole menu 😉) It&apos;s giving &quot;when they finally read your feedback&quot; 💅
                </p>

                <div className="p-2.5 sm:p-3 bg-black/10 rounded-lg">
                  <p className="text-[10px] sm:text-xs flex gap-2 items-center">
                    <span className="text-base sm:text-lg">📢</span>
                    &quot;B-but why?&quot; Bc y&apos;all were matching like 
                    Netflix shows & WiFi passwords 🤦♀️ Time to glow up your DMs, Untill we meet again ,Byeeeee👋
                  </p>
                </div>

                <div className="text-[10px] sm:text-xs opacity-75 flex flex-wrap gap-x-2 gap-y-1">
                  <span>#NotADrill</span>
                  <span className="hidden sm:inline">•</span>
                  <span>#MainCharacterUpdate</span>
                  <span className="hidden sm:inline">•</span>
                  <span>#GlowUp</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Animated sparkles */}
            <motion.div
              className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-2 right-4 text-xl"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-4 left-4 text-xl"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6 }}
            >
              ✨
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};