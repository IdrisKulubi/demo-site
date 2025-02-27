"use client";

import { useEffect, useState } from "react";
import { getStalkers } from "@/lib/actions/stalker.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { EyeIcon } from "lucide-react";

export function StalkersList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stalkers, setStalkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStalkers = async () => {
      try {
        const data = await getStalkers();
        setStalkers(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadStalkers();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <EyeIcon className="h-6 w-6" /> Your Stalkers 👀
      </h2>
      
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : stalkers.length > 0 ? (
        <div className="grid gap-3">
          {stalkers.map((stalker, i) => (
            <motion.div
              key={stalker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={stalker.viewer.image || stalker.viewer.profile?.profilePhoto} />
                  <AvatarFallback>
                    {stalker.viewer.profile?.firstName?.[0] || stalker.viewer.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {stalker.viewer.profile?.firstName || stalker.viewer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Peeked at {new Date(stalker.viewedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          No stalkers yet... but they&apos;re coming! 👻
        </div>
      )}
    </div>
  );
} 