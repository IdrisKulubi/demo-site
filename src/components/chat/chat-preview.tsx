"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";

interface ChatPreviewProps {
  profile: {
    id: string;
    userId: string;
    firstName?: string;
    lastName?: string;
    profilePhoto: string | null;
    matchId: string;
    lastMessage: {
      content: string;
      createdAt: Date;
      isRead: boolean;
      senderId: string;
    };
  };
  currentUser: { id: string; image: string; name: string };
}

export function ChatPreview({ profile, currentUser }: ChatPreviewProps) {
  const hasUnread = profile.lastMessage && 
    profile.lastMessage.senderId !== currentUser.id && 
    !profile.lastMessage.isRead;

  // Memoize the formatted time to prevent unnecessary re-renders
  const formattedTime = useMemo(() => {
    if (!profile.lastMessage?.createdAt) return '';
    return format(new Date(profile.lastMessage.createdAt), "HH:mm");
  }, [profile.lastMessage?.createdAt]);

  // Safely handle name display with fallbacks
  const displayName = useMemo(() => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) {
      return profile.firstName;
    }
    return profile.userId || 'User';
  }, [profile.firstName, profile.lastName, profile.userId]);

  // Get initials for avatar fallback
  const initials = useMemo(() => {
    if (profile.firstName) {
      return profile.firstName[0]?.toUpperCase();
    }
    return profile.userId?.[0]?.toUpperCase() || 'U';
  }, [profile.firstName, profile.userId]);

  return (
    <Button
      variant="ghost"
      className="w-full h-auto p-4 justify-start hover:bg-accent/50"
      asChild
    >
      <Link href={`/chat/${profile.matchId}`} className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={profile.profilePhoto || undefined}
            alt={displayName}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <p className="font-medium truncate">
              {displayName}
            </p>
            {profile.lastMessage && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formattedTime}
              </span>
            )}
          </div>

          <p className={cn(
            "text-sm truncate",
            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {profile.lastMessage?.content || 'No messages yet'}
          </p>
        </div>

        {hasUnread && (
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        )}
      </Link>
    </Button>
  );
} 