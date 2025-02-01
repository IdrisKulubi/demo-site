import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Profile } from "@/db/schema";
import Link from "next/link";

export function MatchCard({ profile }: { profile: Profile }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="group relative bg-white dark:bg-background rounded-xl p-3 shadow-sm border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-purple-200 dark:border-purple-800">
          <AvatarImage src={profile.profilePhoto || profile.photos?.[0]} />
          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white">
            {profile.firstName?.[0]}
            {profile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-medium">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {profile.course} • Year {profile.yearOfStudy}
          </p>
        </div>
        <Link
          href={`/messages/${profile.userId}`}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button size="icon" variant="ghost">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
} 