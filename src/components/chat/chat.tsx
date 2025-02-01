"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Message } from "@/db/schema";
import Pusher from "pusher-js";

interface ChatProps {
  currentUser: string;
  matchId: string;
}

export function Chat({ currentUser, matchId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    const channel = pusher.subscribe(`private-match-${matchId}`);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [matchId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        senderId: currentUser,
        content: newMessage,
      }),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-lg bg-background">
      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.senderId === currentUser
                  ? "justify-end"
                  : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg p-3",
                  message.senderId === currentUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
