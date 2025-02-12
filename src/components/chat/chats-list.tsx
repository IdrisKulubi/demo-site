"use client";

import { useEffect, useState } from "react";
import { ChatPreview } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatsList() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/chat/chats");
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || "Failed to fetch chats");
        
        // Ensure we're setting an array, with a fallback to empty array
        setChats(Array.isArray(data.chats) ? data.chats : []);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError(err instanceof Error ? err.message : "Failed to load chats");
        // Ensure chats is reset to empty array on error
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
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
        <p>No chats yet</p>
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
          </Avatar>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {chat.firstName} {chat.lastName}
              </h3>
              {chat.lastMessageTime && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(chat.lastMessageTime), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground line-clamp-1">
                {chat.lastMessage || "No messages yet"}
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