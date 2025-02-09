"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/providers/chat-provider";
import { MessageBubble } from "./message-bubble";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile, Message } from "@/db/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { usePusher } from "@/hooks/use-pusher";
import { sendMessage } from "@/lib/actions/chat.actions";
import { ArrowLeft } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface ChatWindowProps {
  matchId: string;
  recipient: Profile;
  currentUserId: string;
  initialMessages: Message[];
}

export function ChatWindow({
  matchId,
  recipient,
  currentUserId,
  initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const { setTyping, onlineStatus } = useChat();
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>(null);
  const [loaded, setLoaded] = useState(false);
  const { channel } = usePusher(`private-match-${matchId}`);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const { ref: loadMoreRef, inView } = useInView();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    if (channel) {
      channel.bind("new-message", handleNewMessage);
    }

    return () => {
      if (channel) {
        channel.unbind_all();
      }
    };
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage((prev) => prev + 1);
        setLoadingMore(false);
      }, 1000);
    }
  }, [inView, hasMore, loadingMore]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (draft.trim() && matchId) {
      const optimisticId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          matchId,
          senderId: currentUserId,
          content: draft,
          createdAt: new Date(),
          type: "text",
          isRead: false,
          isOptimistic: true,
        } as Message,
      ]);

      setDraft("");
      setTyping(matchId, false);

      const result = await sendMessage(matchId, draft);
      if (!result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        console.error("Failed to send message:", result.error);
      }
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

  if (!matchId) {
    console.error("ChatWindow: matchId is required");
    return null;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-background">
      {/* Updated Header with Back Button */}
      <div className="flex items-center p-4 border-b border-pink-100 dark:border-pink-900">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          {!loaded && (
            <Skeleton className="h-full w-full rounded-full bg-muted/50 animate-pulse" />
          )}
          <AvatarImage
            src={recipient.profilePhoto || ""}
            onLoad={() => setLoaded(true)}
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
            {isTypingLocal && (
              <span className="text-xs text-muted-foreground">typing...</span>
            )}
          </div>
        </div>
      </div>

      {/* Updated Messages Area with Infinite Scroll */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {hasMore && <div ref={loadMoreRef} className="h-8" />}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              showStatus={true}
              senderPhoto={recipient.profilePhoto}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
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
