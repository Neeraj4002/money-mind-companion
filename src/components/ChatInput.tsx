
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message);
        setMessage('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 flex gap-3 p-4 border-t bg-white/90 backdrop-blur-sm shadow-md">
      <div className="relative flex-1">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about finance, investments, or money management..."
          className="resize-none min-h-[50px] max-h-[200px] rounded-2xl border-gray-200 focus:border-finance focus:ring-1 focus:ring-finance pr-12 shadow-sm"
          disabled={disabled}
        />
        <Button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="absolute right-2 bottom-2 bg-gradient-to-r from-finance to-blue-500 hover:from-finance-dark hover:to-blue-600 transition-all h-[40px] w-[40px] rounded-full p-0 flex items-center justify-center shadow-md"
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
