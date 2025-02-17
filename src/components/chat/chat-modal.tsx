"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { getChats } from "@/lib/actions/chat.actions";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatPreview } from "./chat-preview";
import { EmptyChats } from "./empty-chats";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ChatModal({ open, onOpenChange, currentUser }: ChatModalProps) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (open) {
        setLoading(true);
        const result = await getChats();
        setChats(result);
        setLoading(false);
      }
    };

    loadChats();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Messages</DialogTitle>
      <DialogDescription>Your active conversations</DialogDescription>
      <DialogContent className="sm:max-w-[425px] p-0">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground">Your active conversations</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Spinner className="h-8 w-8 text-pink-500" />
          </div>
        ) : chats.length === 0 ? (
          <EmptyChats />
        ) : (
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {chats.map((chat) => (
                <ChatPreview 
                  key={chat.id} 
                  profile={chat as any}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
} 