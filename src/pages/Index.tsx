
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { toast } from 'sonner';
import { generateFinancialAdvice } from '@/services/geminiService';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text: message, isAi: false }]);
    setIsLoading(true);

    try {
      // Call Gemini API
      const response = await generateFinancialAdvice(message);
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        text: response,
        isAi: true
      }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="py-4 px-6 bg-white border-b">
        <h1 className="text-xl font-semibold text-center text-finance-dark">Financial Advisor AI</h1>
      </header>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4 px-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isAi={message.isAi}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-tr-lg rounded-br-lg rounded-bl-lg border border-gray-200 shadow-sm">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-2 bg-finance rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-finance rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-finance rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t">
        <div className="max-w-3xl mx-auto">
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
