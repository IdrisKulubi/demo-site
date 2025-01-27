"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Profile } from "@/db/schema";

export function LikedAvatars({ profiles }: { profiles: Profile[] }) {
  return (
    <motion.div
      className="absolute -top-20 right-0 flex gap-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {profiles.map((profile, index) => (
        <motion.div
          key={profile.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="relative"
        >
          <Avatar className="h-12 w-12 border-2 border-pink-500 shadow-lg">
            <AvatarImage src={profile.profilePhoto || ""} />
            <AvatarFallback className="bg-pink-500 text-white">
              {profile.firstName?.[0]}
              {profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <motion.div
            className="absolute -right-1 -top-1 text-pink-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            ❤️
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}
