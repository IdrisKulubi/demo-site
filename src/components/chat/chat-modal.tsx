"use client";

import { useEffect, useState } from "react";
import { getChats } from "@/lib/actions/chat.actions";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPreview } from "./chat-preview";
import { EmptyChats } from "./empty-chats";

interface ChatSectionProps {
  currentUser: { id: string; image: string; name: string };
}

interface ChatPreview {
  id: string;
  userId: string;
  profilePhoto: string | null;
  matchId: string;
  lastMessage: {
    content: string;
    createdAt: Date;
    isRead: boolean;
    senderId: string;
  };
}

export function ChatSection({ currentUser }: ChatSectionProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      try {
        const result = await getChats();
        setChats(result);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();

    // Set up polling for new messages
    const interval = setInterval(loadChats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-background">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Spinner className="h-8 w-8 text-pink-500" />
        </div>
      ) : chats.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <EmptyChats />
        </div>
      ) : (
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            {chats.map((chat) => (
              <ChatPreview 
                key={chat.id} 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                profile={chat as any}
                currentUser={currentUser}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
} 