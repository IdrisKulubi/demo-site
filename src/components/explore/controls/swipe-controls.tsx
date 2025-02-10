"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

interface SwipeControlsProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onUndo: () => void;
  onSuperLike?: () => void;
  className?: string;
  disabled?: boolean;
  currentProfileId?: string;
}

export function SwipeControls({
  onSwipeLeft,
  onSwipeRight,
  onUndo,
  onSuperLike,
  className,
  disabled,
  currentProfileId,
}: SwipeControlsProps) {
  const [activeButton, setActiveButton] = useState<
    "left" | "right" | "undo" | "superLike" | null
  >(null);

  const handleButtonClick = useCallback(
    async (type: "left" | "right" | "undo" | "superLike", handler: () => void) => {
      if (disabled) return;
      
      setActiveButton(type);

      const swipeHandler = currentProfileId 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (window as any )[`handleSwipe_${currentProfileId}`] 
        : null;

      if (type === "left" || type === "right") {
        if (swipeHandler) {
          swipeHandler(type);
          setTimeout(handler, 600);
        } else {
          handler();
        }
      } else {
        handler();
      }

      setTimeout(() => setActiveButton(null), 200);
    },
    [disabled, currentProfileId]
  );

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <Button
        variant="ghost"
        onClick={() => handleButtonClick("undo", onUndo)}
        disabled={disabled}
        className={cn(
          "rounded-full h-12 w-12 bg-[#262626] shadow-lg",
          "transition-all duration-200 hover:scale-110",
          activeButton === "undo" && "bg-[#F6B817]/20",
          disabled && "opacity-50 pointer-events-none"
        )}
        aria-label="Undo last swipe"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path
            d="M12.119 4.599V3.307c0-1.216-1.385-1.907-2.32-1.153L4.055 7.203C3.495 7.696 3.495 8.534 4.055 9.027l5.744 5.049c.935.754 2.32.063 2.32-1.153v-1.292c3.817 0 6.906 3.089 6.906 6.906 0 .658.534 1.192 1.192 1.192.659 0 1.192-.534 1.192-1.192 0-5.133-4.157-9.29-9.29-9.29z"
            fill="#F6B817"
          />
        </svg>
      </Button>

      <Button
        onClick={() => handleButtonClick("left", onSwipeLeft)}
        className={cn(
          "rounded-full h-16 w-16 bg-[#262626] shadow-lg",
          activeButton === "left" && "bg-[#FF4458]/20"
        )}
        aria-label="Swipe left"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8">
          <path
            d="M14.926 12.56v-1.14l5.282 5.288c1.056.977 1.056 2.441 0 3.499-.813 1.057-2.438 1.057-3.413 0L12 15.724 7.205 20.207c-.975 1.057-2.6 1.057-3.414 0-1.056-.813-1.056-2.44 0-3.499l5.282-5.288v1.14L4.79 8.272c-1.056-.813-1.056-2.44 0-3.499.814-1.056 2.439-1.056 3.414 0L12 9.256l4.796-4.483c.975-1.056 2.6-1.056 3.413 0 1.056.814 1.056 2.44 0 3.499l-4.283 4.288z"
            fill="#FF4458"
          />
        </svg>
      </Button>

      <Button
        onClick={() =>
          onSuperLike && handleButtonClick("superLike", onSuperLike)
        }
        className={cn(
          "rounded-full h-12 w-12 bg-[#262626] shadow-lg",
          activeButton === "superLike" && "bg-[#00D4FF]/20"
        )}
        aria-label="Super like"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <path
            d="M12 1.441l2.836 5.744c.108.22.302.384.536.443l6.34.923c.584.085.816.85.394 1.287l-4.588 4.475c-.175.17-.255.415-.21.654l1.083 6.313c.1.582-.51 1.027-1.032.752L12 18.975l-5.359 2.817c-.522.275-1.132-.17-1.032-.752l1.083-6.313c.045-.24-.035-.483-.21-.654L1.894 9.598c-.422-.437-.19-1.202.394-1.287l6.34-.923a.776.776 0 00.537-.443L12 1.441z"
            fill="#00D4FF"
          />
        </svg>
      </Button>

      <Button
        onClick={() => handleButtonClick("right", onSwipeRight)}
        className={cn(
          "rounded-full h-16 w-16 bg-[#262626] shadow-lg",
          activeButton === "right" && "bg-[#30E15F]/20"
        )}
        aria-label="Swipe right"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#30E15F"
            stroke="#30E15F"
            strokeWidth="1.5"
          />
        </svg>
      </Button>
    </div>
  );
}
