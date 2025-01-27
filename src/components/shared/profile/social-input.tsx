"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { FaInstagram, FaSpotify, FaSnapchatGhost } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface SocialInputProps {
  values: {
    instagram?: string;
    spotify?: string;
    snapchat?: string;
  };
  onChange: (
    platform: "instagram" | "spotify" | "snapchat",
    value: string
  ) => void;
}

const socialPlatforms = [
  {
    id: "instagram",
    label: "Instagram",
    icon: FaInstagram,
    placeholder: "@yourhandle",
    color: "hover:text-pink-500 focus-within:text-pink-500",
    baseColor: "text-pink-300",
  },
  {
    id: "spotify",
    label: "Spotify",
    icon: FaSpotify,
    placeholder: "spotify username",
    color: "hover:text-green-500 focus-within:text-green-500",
    baseColor: "text-green-300",
  },
  {
    id: "snapchat",
    label: "Snapchat",
    icon: FaSnapchatGhost,
    placeholder: "snapchat username",
    color: "hover:text-yellow-500 focus-within:text-yellow-500",
    baseColor: "text-yellow-300",
  },
];

export function SocialInput({ values, onChange }: SocialInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid gap-6">
        {socialPlatforms.map((platform) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: socialPlatforms.indexOf(platform) * 0.1 }}
            className={cn(
              "relative group flex items-center space-x-4",
              "p-4 rounded-lg transition-colors duration-200",
              "border border-muted bg-muted/50",
              platform.color
            )}
          >
            <platform.icon
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                platform.baseColor,
                "group-hover:" + platform.color.split(" ")[0]
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{platform.label}</p>
              <Input
                value={values[platform.id as keyof typeof values] || ""}
                onChange={(e) =>
                  onChange(
                    platform.id as "instagram" | "spotify" | "snapchat",
                    e.target.value
                  )
                }
                placeholder={platform.placeholder}
                className="mt-1 border-none bg-transparent p-0 focus-visible:ring-0 text-sm"
              />
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Let your matches find you everywhere 🌟 (totally optional tho)
      </p>
    </motion.div>
  );
}
