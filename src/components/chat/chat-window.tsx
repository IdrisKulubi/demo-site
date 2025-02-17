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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";

interface ChatWindowProps {
  matchId: string;
  partner: Profile;
  recipient: Profile;
  onClose: () => void;
  onBack?: () => void;
}

export function ChatWindow({ onClose, onBack, matchId, partner, recipient }: ChatWindowProps) {
  const {
    messages,
    isTyping,
    handleSend,
    handleTyping,
    isLoading,
  } = useChat(matchId, recipient);

  const { data: session } = useSession();
  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        {onBack ? (
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-9" />
        )}
        <Avatar className="h-8 w-8">
          <AvatarImage src={recipient.profilePhoto || undefined} />
          <AvatarFallback>
            {recipient.firstName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8 text-pink-500" />
        </div>
      ) : (
        <>
          <ChatHeader partner={partner} />
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
                    <MessageBubble message={message} />
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
}

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
