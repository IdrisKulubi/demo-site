"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getChats } from "@/lib/actions/chat.actions";
import { motion } from "framer-motion";

type ChatItem = {
  matchId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  course: string;
  yearOfStudy: number;
  lastMessage?: string | null;
  lastMessageTime?: Date | null;
  unreadCount: number;
  matchedAt: Date;
};

export function ChatsList() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const result = await getChats();
        
        if ('error' in result) {
          setError(result.error || "Failed to load chats");
          return;
        }
        
        setChats(result.chats || []);
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
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
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
        <p>No matches yet! Start swiping to find your match 💘</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <motion.div
          key={chat.matchId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={() => router.push(`/chat/${chat.userId}`)}
            className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 rounded-xl transition-colors"
          >
            <Avatar className="h-14 w-14">
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
                  {chat.lastMessage || `Matched ${formatDistanceToNow(new Date(chat.matchedAt), { addSuffix: true })}`}
                </p>
                {chat.unreadCount > 0 && (
                  <Badge className="ml-2 bg-pink-500 text-white">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
} 