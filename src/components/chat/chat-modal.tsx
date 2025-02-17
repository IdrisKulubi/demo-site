"use client";

import { useEffect, useState, useCallback } from "react";
import { getChats } from "@/lib/actions/chat.actions";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPreview } from "./chat-preview";
import { EmptyChats } from "./empty-chats";
import { useInterval } from "@/hooks/use-interval";

interface ChatSectionProps {
  currentUser: { id: string; image: string; name: string };
}

interface ChatPreview {
  id: string;
  userId: string;
  profilePhoto: string | null;
  matchId: string;
  firstName?: string;
  lastMessage: {
    content: string;
    createdAt: Date;
    isRead: boolean;
    senderId: string;
  };
}

export function ChatSection({ currentUser }: ChatSectionProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      // Only show loading state on initial load
      if (isInitialLoading) {
        setIsInitialLoading(true);
      }

      const result = await getChats();
      
      if (result) {
        // Only update if there are actual changes
        setChats(prevChats => {
          const hasChanges = JSON.stringify(prevChats) !== JSON.stringify(result);
          return hasChanges ? result : prevChats;
        });
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }, [isInitialLoading]);

  // Initial fetch
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Silent background updates
  useInterval(() => {
    if (!isInitialLoading) {
      fetchChats();
    }
  }, 3000);

  if (isInitialLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner className="h-8 w-8 text-pink-500" />
      </div>
    );
  }

  if (!isInitialLoading && chats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyChats />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background">
      <ScrollArea className="h-full">
        <div className="space-y-4 p-4">
          {chats.map((chat) => (
            <ChatPreview 
              key={chat.id} 
              profile={chat as ChatPreview}
              currentUser={currentUser}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 