import { useEffect, useState } from 'react';
import PusherClient from 'pusher-js';
import { getUnreadCount } from '@/lib/actions/chat.actions';

const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  forceTLS: true,
});

export function useUnreadMessages(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      const count = await getUnreadCount();
      setUnreadCount(count);
    };

    loadUnreadCount();

    const channel = pusherClient.subscribe(`private-user-${userId}`);
    
    channel.bind('new-message', () => {
      setUnreadCount(prev => prev + 1);
    });
    
    channel.bind('message-read', () => {
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-user-${userId}`);
    };
  }, [userId]);

  return unreadCount;
} 