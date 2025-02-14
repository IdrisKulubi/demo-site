"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getChats } from "@/lib/actions/chat.actions";

type Chat = {
  matchId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  course: string;
  yearOfStudy: number;
  lastMessage: string | null;
  lastMessageTime: Date | null;
  unreadCount: number;
  matchedAt: Date;
};

export function ChatsList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const result = await getChats();
        
        if (result.error) {
          setError(result.error);
          return;
        }
        
        setChats((result.chats || []) as Chat[]);
      } catch (err) {
        console.error("Error loading chats:", err);
        setError("Failed to load chats");
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!chats.length) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No matches yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <button
          key={chat.matchId}
          onClick={() => router.push(`/chat/${chat.userId}`)}
          className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 rounded-lg transition-colors"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={chat.profilePhoto || ""} />
            <AvatarFallback>
              {chat.firstName[0]}
              {chat.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {chat.firstName} {chat.lastName}
              </h3>
              <span className="text-xs text-muted-foreground">
                {chat.lastMessageTime ? (
                  formatDistanceToNow(new Date(chat.lastMessageTime), {
                    addSuffix: true,
                  })
                ) : (
                  `Matched ${formatDistanceToNow(new Date(chat.matchedAt), {
                    addSuffix: true,
                  })}`
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground line-clamp-1">
                {chat.lastMessage ? (
                  chat.lastMessage
                ) : (
                  <span className="text-pink-500">Start a conversation!</span>
                )}
              </p>
              {chat.unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
} 