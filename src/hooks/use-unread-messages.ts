import { useEffect, useState, useCallback, useRef } from 'react';
import { getUnreadCount } from '@/lib/actions/chat.actions';
import { pusherClient } from '@/lib/pusher/client';

export function useUnreadMessages(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const readMessagesRef = useRef<Set<string>>(new Set());
  const isMounted = useRef(true);

  const markAsRead = useCallback((matchId: string) => {
    if (!readMessagesRef.current.has(matchId)) {
      readMessagesRef.current.add(matchId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    const fetchInitialCount = async () => {
      try {
        const count = await getUnreadCount(userId);
        if (isMounted.current) setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    
    fetchInitialCount();

    const channel = pusherClient.subscribe(`private-user-${userId}`);
    
    const handleNewMessage = (data: { matchId: string }) => {
      if (!readMessagesRef.current.has(data.matchId)) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleMessagesRead = (data: { matchId: string }) => {
      readMessagesRef.current.add(data.matchId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    channel.bind('new-message', handleNewMessage);
    channel.bind('messages-read', handleMessagesRead);

    return () => {
      isMounted.current = false;
      channel.unbind('new-message', handleNewMessage);
      channel.unbind('messages-read', handleMessagesRead);
      pusherClient.unsubscribe(`private-user-${userId}`);
    };
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const count = await getUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  return { unreadCount, markAsRead };
} 