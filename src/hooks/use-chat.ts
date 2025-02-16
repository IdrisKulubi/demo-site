import { useEffect, useState, useCallback } from "react";
import Pusher from "pusher-js";
import type { Message, Profile } from "@/db/schema";
import { getChatMessages, sendMessage } from "@/lib/actions/chat.actions";
import { useSession } from "next-auth/react";
import type { Channel } from "pusher-js";
import { toast } from "./use-toast";

type MessageWithSender = Message & {
  sender?: {
    id: string;
    name: string;
    image: string | null;
  };
};

export const useChat = (matchId: string, initialPartner: Profile) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [partner, setPartner] = useState<Profile>(initialPartner);
  const [isTyping, setIsTyping] = useState(false);
  const [channel, setChannel] = useState<Channel>();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [message, ...prev]);
  }, []);

  const handleTypingEvent = useCallback(({ isTyping }: { isTyping: boolean }) => {
    setIsTyping(isTyping);
  }, []);

  useEffect(() => {
    const initChat = async () => {
      const { messages: chatMessages } = await getChatMessages(matchId);
      setMessages(chatMessages);
      
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
      });

      const channel = pusher.subscribe(`match-${matchId}`);
      channel.bind("new-message", handleNewMessage);
      channel.bind("typing", handleTypingEvent);
      setChannel(channel);

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`match-${matchId}`);
      };
    };

    initChat();
  }, [matchId,handleNewMessage,handleTypingEvent]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { messages } = await getChatMessages(matchId);
        setMessages(messages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [matchId]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || !session?.user) return;

      const tempMessage: MessageWithSender = {
        id: `temp-${Date.now()}`,
        content,
        matchId,
        senderId: session.user.id,
        status: "sent",
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: session.user.id,
          name: session.user.name || "",
          image: session.user.image || null
        }
      };

      setMessages(prev => [...prev, tempMessage]);

      try {
        const { message } = await sendMessage(matchId, content, session.user.id);
        setMessages(prev =>
          prev.map(m => m.id === tempMessage.id ? { ...message, sender: tempMessage.sender } as MessageWithSender : m)
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        toast({
          title: "Failed to send message",
          description: "Please try again",
          variant: "destructive"
        });
      }
    },
    [matchId, session?.user]
  );

  const handleTyping = useCallback(async (isTyping: boolean) => {
    channel?.trigger("client-typing", { isTyping });
  }, [channel]);

  return {
    messages,
    partner,
    isTyping,
    handleSend,
    handleTyping,
    loadMoreMessages: () => {}, // Implement pagination
    isLoading
  };
}; 