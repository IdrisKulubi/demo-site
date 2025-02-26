"use client";

import { useEffect, useState } from "react";
import { getContestWinners } from "@/lib/actions/contest.actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { Icons } from "@/components/shared/icons";
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon
} from "react-share";
import Image from "next/image";

export function HallOfFame() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [winners, setWinners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWinners = async () => {
      try {
        const data = await getContestWinners();
        setWinners(data);
      } catch (error) {
        console.error("Error loading winners:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWinners();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner className="h-8 w-8 text-pink-500" />
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-bold mb-2">No Winners Yet</h3>
        <p className="text-muted-foreground">
          Contest winners will be featured here once contests are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {winners.map((winner, index) => (
        <motion.div
          key={winner.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-500/10 to-rose-400/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-pink-500">
                      <AvatarImage src={winner.user.profile?.profilePhoto || winner.user.image || undefined} />
                      <AvatarFallback>
                        {winner.user.profile?.firstName?.[0] || winner.user.name?.[0] || "W"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                      <Icons.trophy className="h-4 w-4 text-yellow-900" />
                    </div>
                  </div>
                  <div>
                    <CardTitle>
                      {winner.user.profile?.firstName} {winner.user.profile?.lastName || winner.user.name}
                    </CardTitle>
                    <CardDescription>
                      Winner of &quot;{winner.contest.title}&quot; contest
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800">
                  {winner.voteCount} votes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {winner.entryType === "photo" ? (
                <div className="space-y-4">
                  <div className="rounded-md overflow-hidden">
                    <Image
                      src={winner.photoUrl} 
                      alt={winner.caption || "Winning entry"} 
                      className="object-contain max-h-[400px] w-full"
                    />
                  </div>
                  {winner.caption && (
                    <p className="italic text-muted-foreground">{winner.caption}</p>
                  )}
                </div>
              ) : (
                <div className="bg-muted/30 p-6 rounded-md italic">
                  <p className="whitespace-pre-wrap">{winner.bioText}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end items-center gap-2">
                <p className="text-sm text-muted-foreground mr-2">Share this winner:</p>
                <FacebookShareButton 
                  url={`${window.location.origin}/hall-of-fame`} 
                  title={`Check out ${winner.user.profile?.firstName}'s winning entry in the ${winner.contest.title} contest!`}
                >
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton 
                  url={`${window.location.origin}/hall-of-fame`} 
                  title={`Check out ${winner.user.profile?.firstName}'s winning entry in the ${winner.contest.title} contest!`}
                  hashtags={["contest", "winner"]}
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton 
                  url={`${window.location.origin}/hall-of-fame`} 
                  title={`Contest Winner: ${winner.user.profile?.firstName} ${winner.user.profile?.lastName || winner.user.name}`}
                >
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
} 