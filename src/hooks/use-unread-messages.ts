import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/actions/chat.actions';
import { pusherClient } from '@/lib/pusher/client';
export function useUnreadMessages(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchInitialCount = async () => {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    };
    fetchInitialCount();

    const channel = pusherClient.subscribe(`private-user-${userId}`);
    
    channel.bind('new-message', (data: { matchId: string }) => {
      if (!readMessages.has(data.matchId)) {
        setUnreadCount(prev => prev + 1);
      }
    });

    channel.bind('messages-read', (data: { matchId: string }) => {
      setReadMessages(prev => new Set(prev.add(data.matchId)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`private-user-${userId}`);
    };
  }, [userId, readMessages]);

  const markAsRead = (matchId: string) => {
    setReadMessages(prev => new Set(prev.add(matchId)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { unreadCount, markAsRead };
} 