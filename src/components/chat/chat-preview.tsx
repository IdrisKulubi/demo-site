"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/db/schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

interface ChatPreviewProps {
  profile: Profile & { lastMessage?: { content: string; createdAt: Date; isRead: boolean }; matchId?: string };
  currentUser: { id: string; image: string; name: string };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ChatPreview({ profile, currentUser }: ChatPreviewProps) {
  const hasUnread = profile.lastMessage && !profile.lastMessage.isRead;
  
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full flex items-center gap-3 p-3 h-auto",
        hasUnread && "bg-muted/50"
      )}
    >
      <Link href={`/chat/${profile.matchId}`}>
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarImage 
            src={profile.profilePhoto ?? undefined} 
            alt={profile.userId}
          />
          <AvatarFallback className="bg-primary/10">
            {profile.userId[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium truncate">
              {profile.userId}
            </p>
            {profile.lastMessage && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {format(new Date(profile.lastMessage.createdAt), "HH:mm")}
              </span>
            )}
          </div>

          {profile.lastMessage && (
            <p className={cn(
              "text-sm truncate",
              hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {profile.lastMessage.content}
            </p>
          )}
        </div>

        {hasUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        )}
      </Link>
    </Button>
  );
} 