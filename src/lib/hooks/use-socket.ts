"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

export function useSocket(url: string) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Add auth token to WebSocket URL
    const wsUrl = new URL(url);
    wsUrl.searchParams.set("token", session.user.id);

    function connect() {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Connected to WebSocket");
        setSocket(ws);
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from WebSocket");
        setSocket(null);
        // Attempt to reconnect after 2 seconds
        reconnectTimeout.current = setTimeout(connect, 2000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    }

    connect();

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url, session?.user?.id]);

  return socket;
}
