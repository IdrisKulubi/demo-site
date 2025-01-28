"use client";

import { FaWhatsapp, FaTwitter, FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARE_TEXT = `✨ Friend You NEED to check out StrathSpace 🌸

It's giving main character energy fr fr! Find your perfect match at Strathmore 💖

Join the vibe: strathspace.com

#StrathSpace #UniFriends #FindYourMatch #ValentinesDay`;

const SHARE_OPTIONS = [
  {
    name: "WhatsApp",
    icon: <FaWhatsapp className="h-5 w-5" />,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    url: `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    name: "X (Twitter)",
    icon: <FaTwitter className="h-5 w-5" />,
    color: "bg-black dark:bg-white",
    textColor: "text-white dark:text-black",
    hoverColor: "hover:bg-gray-800 dark:hover:bg-gray-200",
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      SHARE_TEXT
    )}`,
  },
  {
    name: "Instagram",
    icon: <FaInstagram className="h-5 w-5" />,
    color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
    hoverColor: "hover:from-purple-600 hover:via-pink-600 hover:to-orange-600",
    action: () => {
      navigator.clipboard.writeText(SHARE_TEXT);
    },
  },
];

export function ShareAppModal({ isOpen, onClose }: ShareAppModalProps) {
  const handleShare = (option: (typeof SHARE_OPTIONS)[0]) => {
    if (option.url) {
      window.open(option.url, "_blank");
    } else if (option.action) {
      option.action();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <span className="text-2xl">✨</span>
            Share StrathSpace
            <span className="text-2xl">💖</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share Text Preview */}
          <div className="relative rounded-xl bg-pink-50/50 dark:bg-pink-950/50 p-4 border border-pink-100 dark:border-pink-900">
            <div className="absolute -top-3 -right-2 text-2xl animate-bounce">
              ✨
            </div>
            <p className="whitespace-pre-line text-sm">{SHARE_TEXT}</p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {SHARE_OPTIONS.map((option, index) => (
                <motion.div
                  key={option.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    className={`w-full h-auto py-4 px-4 ${option.color} ${
                      option.hoverColor
                    } ${
                      option.textColor || "text-white"
                    } shadow-sm transition-all hover:shadow-md`}
                    onClick={() => handleShare(option)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xl">
                        {typeof option.icon === "string"
                          ? option.icon
                          : option.icon}
                      </span>
                      <span className="text-sm font-medium">{option.name}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Copy Success Message for Instagram */}
          <p className="text-center text-xs text-muted-foreground">
            For Instagram: Text will be copied to clipboard 📋
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
