"use client";

import { MessageCircleOff } from "lucide-react";

export function EmptyChats() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] p-4 text-center">
      <MessageCircleOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        When you match with someone, your conversations will appear here
      </p>
    </div>
  );
} 