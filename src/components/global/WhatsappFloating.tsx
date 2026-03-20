"use client";

import { cn } from "@/lib/utils";
import { IconBrandWhatsapp } from "@tabler/icons-react";

interface WhatsAppFloatingProps {
  phone: string; // with country code (no +)
  message?: string;
  className?: string;
}

export default function WhatsAppFloating({
  phone,
  message = "Hi, I want to inquire about your services.",
  className,
}: WhatsAppFloatingProps) {
  const encodedMessage = encodeURIComponent(message);

  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-60",
        "flex items-center justify-center",
        "h-14 w-14 rounded-full",
        "bg-green-500 hover:bg-green-600",
        "text-white shadow-lg",
        "transition-all duration-300",
        "hover:scale-110 active:scale-95",
        className,
      )}>
      <IconBrandWhatsapp strokeWidth={1} className="size-10" />
    </a>
  );
}
