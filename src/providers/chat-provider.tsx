"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher/client";
import type { Message } from "@/db/schema";

interface ChatContextType {
  sendMessage: (matchId: string, content: string) => Promise<void>;
  setTyping: (matchId: string, isTyping: boolean) => void;
  messages: Message[];
  onlineStatus: Record<string, boolean>;
  loadMessages: (matchId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>(null!);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = pusherClient.subscribe(`private-user-${session.user.id}`);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    channel.bind("user-online", (userId: string) => {
      setOnlineStatus((prev) => ({ ...prev, [userId]: true }));
    });

    channel.bind("user-offline", (userId: string) => {
      setOnlineStatus((prev) => ({ ...prev, [userId]: false }));
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-user-${session.user.id}`);
    };
  }, [session?.user?.id]);

  const loadMessages = async (matchId: string) => {
    try {
      const response = await fetch(`/api/chat/${matchId}/messages`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (matchId: string, content: string) => {
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const setTyping = async (matchId: string, isTyping: boolean) => {
    await pusherClient.trigger(
      `private-match-${matchId}`,
      isTyping ? "typing-start" : "typing-stop",
      { userId: session?.user?.id }
    );
  };

  return (
    <ChatContext.Provider
      value={{ messages, sendMessage, setTyping, onlineStatus, loadMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
