
import React, { useState } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { toast } from 'sonner';

interface Message {
  text: string;
  isAi: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm your AI financial advisor. Ask me anything about finance, investments, or money management.",
      isAi: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text: message, isAi: false }]);
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to Gemini
      // For now, we'll simulate a response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "I'm a placeholder response. Once connected to Gemini API, I'll provide real financial advice!",
          isAi: true
        }]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isAi={message.isAi}
            />
          ))}
          {isLoading && (
            <div className="animate-pulse flex gap-2 items-center text-gray-500">
              <div className="w-2 h-2 bg-finance rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-finance rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-finance rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-2xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
