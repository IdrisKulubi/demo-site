"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Pusher from "pusher-js";
import type { Channel } from "pusher-js";

type PusherContextType = {
  channel: Channel | null;
};

const PusherContext = createContext<PusherContextType>({ channel: null });

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    return () => pusher.disconnect();
  }, []);

  return (
    <PusherContext.Provider value={{ channel }}>
      {children}
    </PusherContext.Provider>
  );
};

export const usePusher = () => useContext(PusherContext); 