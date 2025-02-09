"use client";

import { cn } from "@/lib/utils";
import type { messages, users } from "@/db/schema";
import { motion } from "framer-motion";

export function MessageBubble({
  message,
  isOwn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showStatus,
  showTimestamp = true,
  senderPhoto,
}: {
  message: typeof messages.$inferSelect & {
    sender?: typeof users.$inferSelect | string;
  };
  isOwn: boolean;
  showStatus: boolean;
  senderPhoto: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-1", isOwn ? "items-end" : "items-start")}
    >
      <div
        className={cn(
          "rounded-2xl p-3 max-w-[80%]",
          isOwn
            ? "bg-pink-500 text-white rounded-br-none"
            : "bg-muted rounded-bl-none"
        )}
      >
        <p className="text-sm">{message.content}</p>
      </div>
      {showTimestamp && (
        <span className="text-xs text-muted-foreground px-2">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      )}
    </motion.div>
  );
}
