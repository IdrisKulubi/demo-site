import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ChatIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const ChatIconButton = forwardRef<HTMLButtonElement, ChatIconButtonProps>(
  ({ className, active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full p-2 hover:bg-accent transition-colors duration-200",
          active && "bg-accent",
          className
        )}
        {...props}
      />
    );
  }
);

ChatIconButton.displayName = "ChatIconButton"; 