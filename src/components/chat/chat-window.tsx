"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/providers/chat-provider";
import { MessageBubble } from "./message-bubble";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Profile } from "@/db/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatWindow({
  matchId,
  recipient,
}: {
  matchId: string;
  recipient: Profile;
}) {
  const [draft, setDraft] = useState("");
  const { sendMessage, setTyping, messages, onlineStatus } = useChat();
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>(null);
  const [loaded, setLoaded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (draft.trim()) {
      sendMessage(draft);
      setDraft("");
      setTyping(matchId, false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(e.target.value);
    if (!isTypingLocal) {
      setTyping(matchId, true);
      setIsTypingLocal(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(matchId, false);
      setIsTypingLocal(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-background">
      {/* Chat Header */}
      <div className="flex items-center p-4 border-b border-pink-100 dark:border-pink-900">
        <Avatar className="h-10 w-10">
          {!loaded && (
            <Skeleton className="h-full w-full rounded-full bg-muted/50 animate-pulse" />
          )}
          <AvatarImage
            src={recipient.profilePhoto || ""}
            onLoadingComplete={() => setLoaded(true)}
            className={loaded ? "visible" : "hidden"}
          />
          <AvatarFallback>
            {loaded ? (
              `${recipient.firstName?.[0]}${recipient.lastName?.[0]}`
            ) : (
              <span className="text-muted-foreground/50">...</span>
            )}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <h2 className="font-semibold">
            {recipient.firstName} {recipient.lastName}
          </h2>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                onlineStatus[recipient.userId] ? "bg-green-500" : "bg-gray-400"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {onlineStatus[recipient.userId] ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === recipient.userId}
              showStatus={true}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTypingLocal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mt-4"
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200" />
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300" />
              </div>
              <span className="text-sm text-muted-foreground">
                {recipient.firstName} is typing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-pink-100 dark:border-pink-900">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl bg-background"
          />
          <Button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="rounded-2xl bg-pink-500 hover:bg-pink-600 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
