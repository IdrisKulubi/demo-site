"use client";
import Pusher from "pusher-js";
import { createContext, useContext, useEffect, useState } from "react";

type PusherContextType = {
  channel: Pusher.Channel | null;
};

const PusherContext = createContext<PusherContextType>({ channel: null });

export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const [channel, setChannel] = useState<Pusher.Channel | null>(null);

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