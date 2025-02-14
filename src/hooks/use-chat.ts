import { Message } from '@/lib/constants';
import { pusherClient } from '@/lib/pusher/client';
import { useEffect, useState } from 'react';

export function useChat(matchId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(`private-match-${matchId}`);

    channel.bind('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    channel.bind('typing-start', () => setTyping(true));
    channel.bind('typing-stop', () => setTyping(false));

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-match-${matchId}`);
    };
  }, [matchId]);

  return { messages, typing, setMessages };
} 