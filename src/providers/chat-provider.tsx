"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/hooks/use-socket";
import type { messages as MessagesTable } from "@/db/schema";

type ChatContextType = {
  sendMessage: (message: string, matchId: string) => void;
  setTyping: (matchId: string, isTyping: boolean) => void;
  messages: (typeof MessagesTable.$inferSelect)[];
  onlineStatus: Record<string, boolean>;
  typingStatus: Record<string, boolean>;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const socket = useSocket("ws://localhost:3001");
  const [messages, setMessages] = useState<ChatContextType["messages"]>([]);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!socket || !session) return;

    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "message":
          setMessages((prev) => [...prev, message]);
          break;
        case "presence":
          setOnlineStatus((prev) => ({
            ...prev,
            [message.userId]: message.isOnline,
          }));
          break;
        case "typing":
          setTypingStatus((prev) => ({
            ...prev,
            [message.userId]: message.isTyping,
          }));
          break;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, session]);

  const chatFunctions = {
    sendMessage: useCallback(
      (content: string) => {
        socket?.send(
          JSON.stringify({
            type: "message",
            content,
            senderId: session?.user.id,
          })
        );
      },
      [socket, session]
    ),

    setTyping: useCallback(
      (matchId: string, isTyping: boolean) => {
        socket?.send(
          JSON.stringify({
            type: "typing",
            matchId,
            isTyping,
          })
        );
      },
      [socket]
    ),

    messages,
    onlineStatus,
    typingStatus,
  };

  return (
    <ChatContext.Provider value={chatFunctions}>
      {children}
    </ChatContext.Provider>
  );
}
