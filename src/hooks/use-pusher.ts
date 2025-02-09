"use client";

import { useEffect, useState } from "react";
import { initializePusher } from "@/lib/pusher/client";
import { useSession } from "next-auth/react";
import { Channel } from "pusher-js";
import Pusher from "pusher-js";

export const usePusher = (channelName?: string) => {
  const [pusher, setPusher] = useState<Pusher | undefined>();
  const [channel, setChannel] = useState<Channel | undefined>();
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && session?.user?.id) {
      const pusherClient = initializePusher();
      setPusher(pusherClient);

      return () => {
        pusherClient.disconnect();
      };
    }
  }, [session]);

  useEffect(() => {
    if (pusher && channelName) {
      const newChannel = pusher.subscribe(channelName) as Channel;
      setChannel(newChannel);

      return () => {
        pusher.unsubscribe(channelName);
      };
    }
  }, [pusher, channelName]);

  return { pusher, channel };
};
