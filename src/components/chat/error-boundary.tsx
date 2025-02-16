"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ChatErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Chat Error:", error);
  }, [error]);

  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-medium mb-2">Chat Connection Error</h2>
      <p className="text-muted-foreground mb-4">
        {error.message || "Failed to connect to chat"}
      </p>
      <Button onClick={reset}>Retry Connection</Button>
    </div>
  );
} 