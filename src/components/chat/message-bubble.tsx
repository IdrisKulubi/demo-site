"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Message } from "@/db/schema";

import { useSession } from "next-auth/react";

export const MessageBubble = ({ message }: { message: Message }) => {
  const { data: session } = useSession();
  const isSent = message.status === "sent";
  const isDelivered = message.status === "delivered";
  const isRead = message.status === "read";

  return (
    <div className={cn(
      "flex flex-col gap-1 max-w-[80%]",
      message.senderId === session?.user.id ? "ml-auto" : "mr-auto"
    )}>
      <div className={cn(
        "p-3 rounded-2xl",
        message.senderId === session?.user.id 
          ? "bg-primary text-primary-foreground rounded-br-none"
          : "bg-muted rounded-bl-none"
      )}>
        <p>{message.content}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs opacity-75">
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
          {message.senderId === session?.user.id && (
            <div className="flex items-center gap-1">
              {isSent && <span>✓</span>}
              {isDelivered && <span>✓✓</span>}
              {isRead && <span className="text-primary">✓✓</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
