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
    // Format phone number: remove any non-digit characters and ensure it starts with country code
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const formattedNumber = cleanNumber.startsWith("254")
      ? cleanNumber
      : cleanNumber.startsWith("0")
      ? `254${cleanNumber.slice(1)}`
      : `254${cleanNumber}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      variant={variant}
      size={size}
      className={`gap-2 ${className} bg-green-500 hover:bg-green-700 text-white`}
    >
      <FaWhatsapp className="h-5 w-5" />
    </Button>
  );
}
