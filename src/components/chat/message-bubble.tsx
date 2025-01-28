"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { messages, users } from "@/db/schema";

export function MessageBubble({
  message,
  isOwn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showStatus,
}: {
  message: typeof messages.$inferSelect & {
    sender?: typeof users.$inferSelect | string;
  };
  isOwn: boolean;
  showStatus: boolean;
}) {
  const senderPhoto =
    typeof message.sender === "object" && message.sender
      ? (message.sender as typeof users.$inferSelect).profilePhoto
      : null;

  return (
    <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
      {!isOwn && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={senderPhoto ?? ""} />
        </Avatar>
      )}

      <div
        className={cn(
          "p-3 rounded-2xl max-w-[70%]",
          isOwn
            ? "bg-pink-500 text-white rounded-br-none"
            : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"
        )}
      >
        <p>{message.content}</p>
        <div className="flex items-center gap-1.5 mt-1.5 justify-end">
          <span className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOwn && (
            <span className="text-xs">
              {message.read ? "👁️✔️" : message.delivered ? "✔️" : "🕒"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
