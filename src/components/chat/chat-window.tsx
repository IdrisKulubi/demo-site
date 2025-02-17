"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/providers/chat-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SendHorizonal, SmilePlus, ImageIcon } from "lucide-react";
import type { Profile } from "@/db/schema";

interface ChatWindowProps {
  matchId: string;
  recipient: Profile;
}

export function ChatWindow({ matchId, recipient }: ChatWindowProps) {
  const { messages, sendMessage, setTyping, onlineStatus, loadMessages } = useChat();
  const [draft, setDraft] = useState("");
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages(matchId);
    scrollToBottom();
  }, [matchId, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (draft.trim()) {
      await sendMessage(matchId, draft.trim());
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

  if (!recipient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800">
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipient?.profilePhoto || ""} />
          <AvatarFallback>
            {recipient?.firstName?.[0]}
            {recipient?.lastName?.[0]}
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
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex",
                  message.senderId === recipient.userId ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl p-3",
                    message.senderId === recipient.userId
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  )}
                >
                  <p>{message.content}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-xs opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.senderId !== recipient.userId && (
                      <span className="text-xs">
                        {message.isRead ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2">
          <div className="flex gap-2 flex-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <SmilePlus className="h-5 w-5 text-pink-500" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ImageIcon className="h-5 w-5 text-pink-500" />
            </Button>
          </div>
          <Input
            value={draft}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Say something nice..."
            className="flex-1 rounded-full bg-background"
          />
          <Button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="rounded-full bg-pink-500 hover:bg-pink-600 text-white"
          >
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
