
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Search, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ChatInputProps {
  onSendMessage: (message: string, useWebSearch: boolean) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message, useWebSearch);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message, useWebSearch);
        setMessage('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 p-4 border-t bg-white/90 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="web-search"
            checked={useWebSearch}
            onCheckedChange={setUseWebSearch}
            className="data-[state=checked]:bg-finance"
          />
          <label 
            htmlFor="web-search" 
            className="text-sm font-medium flex items-center cursor-pointer"
          >
            <Search className="h-4 w-4 mr-1 inline" />
            Web Search
          </label>
        </div>
      </div>
      
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
