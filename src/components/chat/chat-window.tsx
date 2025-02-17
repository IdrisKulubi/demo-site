"use client";

import { useChat } from "@/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { type Profile } from "@/db/schema";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { useEffect } from "react";
import { markMessagesAsRead } from "@/lib/actions/chat.actions";


interface ChatWindowProps {
  matchId: string;
  partner: Profile;
  onClose?: () => void;
}

export const ChatWindow = ({ matchId, onClose, partner }: ChatWindowProps) => {
  const {
    messages,
    isTyping,
    handleSend,
    handleTyping,
    isLoading,
  } = useChat(matchId, partner);

  const { data: session } = useSession();
  const { markAsRead } = useUnreadMessages(session?.user.id ?? "");

  useEffect(() => {
    // Mark as read when chat opens
    markAsRead(matchId);
    // Update backend
    markMessagesAsRead(matchId, session?.user.id ?? "");
  }, [matchId, markAsRead, session?.user.id]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader 
        partner={partner}
        onClose={onClose ?? (() => {})}
      />

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8 text-pink-500" />
        </div>
      ) : (
        <>
          <div className="px-4 py-2 text-sm text-muted-foreground text-center border-b">
            You matched with {partner.firstName} on {new Date(partner.createdAt).toLocaleDateString()}
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex",
                      message.senderId === session?.user.id ? "justify-end" : "justify-start"
                    )}
                  >
                    <MessageBubble 
                      message={message} 
                      isUser={message.senderId === session?.user.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground mt-4">
                <TypingIndicator />
                <span>{partner?.firstName} is typing...</span>
              </div>
            )}
          </ScrollArea>

          <ChatInput 
            onSend={handleSend}
            onTyping={handleTyping}
          />
        </>
      )}
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex space-x-1">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="w-2 h-2 bg-primary rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);
