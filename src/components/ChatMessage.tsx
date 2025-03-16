
import React from 'react';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAi: boolean;
}

const ChatMessage = ({ message, isAi }: ChatMessageProps) => {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg mb-4 animate-fade-in backdrop-blur-sm",
        isAi 
          ? "bg-finance-light border border-gray-200 shadow-sm" 
          : "bg-finance text-white ml-auto max-w-[80%]"
      )}
    >
      <p className="text-sm md:text-base leading-relaxed">{message}</p>
    </div>
  );
};

export default ChatMessage;
