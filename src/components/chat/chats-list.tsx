"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Chat {
  matchId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

interface ChatsListProps {
  onSelectChat?: (chat: Chat) => void;
}

export function ChatsList({ onSelectChat }: ChatsListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const response = await fetch("/api/chat/chats");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setChats(data);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
    // Set up polling for new messages
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4 text-center">Loading chats...</div>;

  return (
    <div className="space-y-4 p-4">
      {chats.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No chats yet. Start a conversation with your matches! 💭
        </div>
      ) : (
        chats.map((chat) => (
          <motion.div
            key={chat.matchId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
            onClick={() => onSelectChat?.(chat)}
          >
            <div className="flex flex-1 items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={chat.profilePhoto || ""} />
                <AvatarFallback>
                  {chat.firstName[0]}
                  {chat.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">
                  {chat.firstName} {chat.lastName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(chat.lastMessageAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
} 