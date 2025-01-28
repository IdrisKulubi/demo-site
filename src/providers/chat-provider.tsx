"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/hooks/use-socket";
import type { messages as MessagesTable } from "@/db/schema";

type ChatContextType = {
  sendMessage: (message: string) => void;
  setTyping: (matchId: string, isTyping: boolean) => void;
  messages: (typeof MessagesTable.$inferSelect)[];
  onlineStatus: Record<string, boolean>;
};

const ChatContext = createContext<ChatContextType>(null!);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socket = useSocket("ws://localhost:3001");
  const [messages, setMessages] = useState<
    (typeof MessagesTable.$inferSelect)[]
  >([]);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!socket || !session) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "message":
          setMessages((prev) => [
            ...prev,
            {
              ...message,
              sender: {
                id: message.senderId,
                name: message.sender,
                email: "",
                emailVerified: null,
                image: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastActive: new Date(),
                isOnline: false,
                profilePhoto: null,
              },
            },
          ]);
          break;
        case "presence":
          setOnlineStatus((prev) => ({
            ...prev,
            [message.userId]: message.isOnline,
          }));
          break;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, session]);

  const value = {
    sendMessage: (content: string) => {
      socket?.send(
        JSON.stringify({
          type: "message",
          content,
          senderId: session?.user.id,
        })
      );
    },
    setTyping: (matchId: string, isTyping: boolean) => {
      socket?.send(
        JSON.stringify({
          type: "typing",
          matchId,
          isTyping,
        })
      );
    },
    messages,
    onlineStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
