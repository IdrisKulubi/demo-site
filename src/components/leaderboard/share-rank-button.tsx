"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareRankButtonProps {
  rank: number;
  score: number;
}

export function ShareRankButton({ rank, score }: ShareRankButtonProps) {
  const handleShare = async () => {
    const shareText = `🔥 Just hit ${score} XP and ranked #${rank} on ValSpace! Who's up for some competition? 💘`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My ValSpace Ranking",
          text: shareText,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard! 📋",
          description: "Share your achievement with friends!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Couldn't share 😅",
        description: "But you're still awesome!",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className="mt-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
} 