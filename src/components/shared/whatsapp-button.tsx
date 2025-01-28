"use client";

import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  size?: "default" | "sm";
  className?: string;
  variant?: "default" | "outline";
}

export function WhatsAppButton({
  phoneNumber,
  message = "Hey! I matched with you on StrathSpace, let's know each other better 💝",
  className = "",
  variant = "default",
  size = "default",
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
    >
      <FaWhatsapp className="h-5 w-5" />
    </Button>
  );
}
