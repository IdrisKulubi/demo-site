"use client";

import { useChat } from "@/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { type Profile } from "@/db/schema";

interface ChatWindowProps {
  matchId: string;
  partner: Profile;
  recipient: Profile;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ChatWindow = ({ matchId, partner, recipient }: ChatWindowProps) => {
  const {
    messages,
    isTyping,
    handleSend,
    handleTyping,
  } = useChat(matchId);

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader partner={partner} />
      
      <ScrollArea className="flex-1 p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <TypingIndicator />
            <span>{partner?.firstName} is typing...</span>
          </div>
        )}
      </ScrollArea>

      <ChatInput 
        onSend={handleSend}
        onTyping={handleTyping}
      />
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
