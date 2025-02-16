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

  const contentLength = message.content.length;
  const isShortMessage = contentLength < 20;
  const isLongMessage = contentLength > 100;

  return (
    <div className={cn(
      "flex flex-col gap-1",
      "max-w-[85%] sm:max-w-[75%] md:max-w-[65%]", 
      message.senderId === session?.user.id ? "ml-auto" : "mr-auto"
    )}>
      <div className={cn(
        "rounded-2xl transition-colors",
        isShortMessage 
          ? "px-2 py-1.5" 
          : isLongMessage 
            ? "p-2.5 sm:p-3" 
            : "px-2.5 py-2 sm:p-2.5",
        isShortMessage ? "text-sm" : isLongMessage ? "text-[0.925rem]" : "text-base",
        isShortMessage ? "w-fit" : "w-full",
        message.senderId === session?.user.id 
          ? "bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 text-white rounded-br-none" 
          : "bg-muted/80 dark:bg-muted/40 rounded-bl-none hover:bg-muted/90 dark:hover:bg-muted/50"
      )}>
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        
        <div className={cn(
          "flex items-center gap-2",
          isShortMessage ? "mt-0" : "mt-1"
        )}>
          <span className={cn(
            "text-xs opacity-75",
            message.senderId === session?.user.id 
              ? "text-white/90" 
              : "text-muted-foreground"
          )}>
            {format(new Date(message.createdAt), "HH:mm")}
          </span>
          
          {message.senderId === session?.user.id && (
            <div className="flex items-center gap-0.5 text-[0.7rem]">
              {isSent && <span className="text-blue-300/80">✓</span>}
              {isDelivered && <span className="text-blue-300/80">✓✓</span>}
              {isRead && <span className="text-blue-600">✓✓</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
