import { useEffect, useState, useCallback } from "react";
import Pusher from "pusher-js";
import type { Message, Profile } from "@/db/schema";
import { getChatMessages, sendMessage } from "@/lib/actions/chat.actions";
import { useSession } from "next-auth/react";
import type { Channel } from "pusher-js";


export const useChat = (matchId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [channel, setChannel] = useState<Channel>();
  const { data: session } = useSession();
  const senderId = session?.user.id ?? "";
  const handleNewMessage = useCallback((message: Message) => {
    setMessages(prev => [message, ...prev]);
  }, []);

  const handleTypingEvent = useCallback(({ isTyping }: { isTyping: boolean }) => {
    setIsTyping(isTyping);
  }, []);

  useEffect(() => {
    const initChat = async () => {
      const { messages: chatMessages, partner: chatPartner } = await getChatMessages(matchId);
      setMessages(chatMessages);
      setPartner(chatPartner ?? null);
      
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

  const handleSend = useCallback(async (content: string) => {
    const { message } = await sendMessage(matchId, content,senderId);
    setMessages(prev => [message, ...prev]);
  }, [matchId,senderId]);

  const handleTyping = useCallback(async (isTyping: boolean) => {
    channel?.trigger("client-typing", { isTyping });
  }, [channel]);

  return {
    messages,
    partner,
    isTyping,
    handleSend,
    handleTyping,
    loadMoreMessages: () => {} // Implement pagination
  };
}; 