import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Profile } from "@/db/schema";
import { Heart, X } from "lucide-react";

interface MatchCardProps {
  profile: Profile;
  onLikeBack: (userId: string) => Promise<void>;
  onUnlike: (userId: string) => Promise<void>;
  isProcessing?: boolean;
}

export function MatchCard({
  profile,
  onLikeBack,
  onUnlike,
  isProcessing,
}: MatchCardProps) {
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

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onLikeBack(profile.userId)}
            disabled={isProcessing}
            className="hover:bg-pink-100/50 dark:hover:bg-pink-950/50 text-pink-500 dark:text-pink-400"
          >
            {isProcessing ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin">⌛</span>
                <span className="text-xs">Loading...</span>
              </span>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-1.5" />
                <span className="text-xs">Like Back</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUnlike(profile.userId)}
            disabled={isProcessing}
            className="hover:bg-rose-100/50 dark:hover:bg-rose-950/50 text-rose-500 dark:text-rose-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
