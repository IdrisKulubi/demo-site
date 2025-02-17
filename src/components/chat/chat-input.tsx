"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

export function ChatInput({
  onSend,
  onTyping,
}: {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}) {
  const [draft, setDraft] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.trim()) {
      onSend(draft);
      setDraft("");
      onTyping(false);
    }
  };

  const handleChange = (value: string) => {
    setDraft(value);
    if (!timeoutRef.current) {
      onTyping(true);
    }
    
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onTyping(false);
      timeoutRef.current = undefined;
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type a message..."
          className="rounded-2xl"
        />
        <Button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-2xl"
        >
          Send
        </Button>
      </div>
    </form>
  );
} 