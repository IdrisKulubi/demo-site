"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContestEntry } from "@/db/schema";
import { voteForEntry } from "@/lib/actions/contest.actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon
} from "react-share";
import Image from "next/image";

interface ContestEntryCardProps {
  entry: ContestEntry & { 
    user: { 
      id: string; 
      name: string; 
      image: string | null;
      profile: {
        firstName: string;
        lastName: string;
        profilePhoto: string | null;
      } | null;
    };
    hasVoted: boolean;
  };
  showDetail?: boolean;
}

export function ContestEntryCard({ entry, showDetail = false }: ContestEntryCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(entry.hasVoted);
  const [voteCount, setVoteCount] = useState(entry.voteCount);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const handleVote = async () => {
    if (hasVoted || isVoting) return;
    
    try {
      setIsVoting(true);
      const result = await voteForEntry(entry.id);
      
      if (result.success) {
        setHasVoted(true);
        setVoteCount(result.voteCount || voteCount || 0   + 1);
        toast({
          title: "Vote recorded!",
          description: "Your vote has been counted",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to vote",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const shareUrl = `${window.location.origin}/contests/${entry.contestId}/entries/${entry.id}`;
  const shareTitle = `Check out this amazing ${entry.entryType} contest entry!`;

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={entry.user.profile?.profilePhoto || entry.user.image || undefined} />
              <AvatarFallback>
                {entry.user.profile?.firstName?.[0] || entry.user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {entry.user.profile?.firstName} {entry.user.profile?.lastName || entry.user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow">
          {entry.entryType === "photo" && (
            <div className="relative aspect-square rounded-md overflow-hidden mb-2">
              <Image 
                src={entry.photoUrl || ""} 
                alt={entry.caption || "Contest entry"} 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          {entry.caption && entry.entryType === "photo" && (
            <p className="text-sm mt-2">{entry.caption}</p>
          )}
          
          {entry.entryType === "bio" && (
            <div className="relative">
              <p className={cn(
                "text-sm whitespace-pre-wrap",
                !showDetail && "line-clamp-4"
              )}>
                {entry.bioText}
              </p>
              {!showDetail && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant={hasVoted ? "secondary" : "default"}
              size="sm"
              onClick={handleVote}
              disabled={hasVoted || isVoting}
              className={cn(
                hasVoted && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
              )}
            >
              {isVoting ? (
                <Icons.spinner className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Icons.heart className={cn(
                  "h-4 w-4 mr-1",
                  hasVoted && "fill-pink-500 text-pink-500"
                )} />
              )}
              <AnimatePresence mode="wait">
                <motion.span
                  key={voteCount}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {voteCount}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDetailOpen(true)}
          >
            <Icons.expand className="h-4 w-4 mr-1" />
            View
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Contest Entry</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.user.profile?.profilePhoto || entry.user.image || undefined} />
                <AvatarFallback>
                  {entry.user.profile?.firstName?.[0] || entry.user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {entry.user.profile?.firstName} {entry.user.profile?.lastName || entry.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {entry.entryType === "photo" && (
              <div className="rounded-md overflow-hidden">
                <Image 
                  src={entry.photoUrl || ""} 
                  alt={entry.caption || "Contest entry"} 
                  className="object-contain max-h-[60vh] w-full"
                />
                {entry.caption && (
                  <p className="mt-2 text-sm">{entry.caption}</p>
                )}
              </div>
            )}
            
            {entry.entryType === "bio" && (
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="whitespace-pre-wrap">{entry.bioText}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4">
              <Button
                variant={hasVoted ? "secondary" : "default"}
                onClick={handleVote}
                disabled={hasVoted || isVoting}
                className={cn(
                  hasVoted && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                )}
              >
                {isVoting ? (
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Icons.heart className={cn(
                    "h-4 w-4 mr-2",
                    hasVoted && "fill-pink-500 text-pink-500"
                  )} />
                )}
                {hasVoted ? "Voted" : "Vote"} ({voteCount})
              </Button>
              
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground mr-2">Share:</p>
                <FacebookShareButton url={shareUrl} title={shareTitle}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl} title={shareTitle} hashtags={["contest", "creativity"]}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl} title={shareTitle}>
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 