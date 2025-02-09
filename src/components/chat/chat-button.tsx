"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { ChatWindow } from "./chat-window";
import { Profile } from "@/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  matchId: string;
  currentUserId: string;
  unreadCount: number;
  recipient: Profile;
}

export function ChatButton({
  matchId,
  currentUserId,
  unreadCount,
  recipient,
}: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!matchId) {
    console.error("ChatButton: matchId is required");
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative hover:bg-pink-50 dark:hover:bg-pink-900/20"
      >
        <MessageCircle className="h-5 w-5 text-pink-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex items-center gap-4 p-4 border-b">
            <Avatar>
              <AvatarImage src={recipient.profilePhoto || ""} />
              <AvatarFallback>{recipient.firstName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{recipient.firstName}</h3>
              <p className="text-sm text-muted-foreground">
                {recipient.bio?.substring(0, 50)}...
              </p>
            </div>
          </DialogHeader>

          <ChatWindow
            matchId={matchId}
            recipient={recipient}
            currentUserId={currentUserId}
            initialMessages={[]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
