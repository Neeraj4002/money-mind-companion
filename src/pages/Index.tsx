
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { toast } from 'sonner';
import { generateFinancialAdvice } from '@/services/geminiService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';

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

  const handleSendMessage = async (message: string, useWebSearch: boolean = false) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text: message, isAi: false }]);
    setIsLoading(true);

    try {
      // If web search is enabled, show a searching message
      if (useWebSearch) {
        toast.info("Searching the web for relevant information...");
      }
      
      // Call Gemini API with web search option
      const response = await generateFinancialAdvice(message, useWebSearch);
      
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
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Background gradient bubbles - updated with pink, blue, white */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-pink-200 to-pink-300 opacity-60 blur-3xl"></div>
        <div className="absolute bottom-40 right-20 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-blue-200 to-blue-300 opacity-60 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-gradient-to-r from-white to-blue-50 opacity-70 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[200px] h-[200px] rounded-full bg-gradient-to-r from-pink-100 to-white opacity-50 blur-3xl"></div>
      </div>
      
      <header className="py-4 px-6 bg-white/80 backdrop-blur-sm border-b z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-center">
          <h1 className="text-xl font-semibold text-center text-finance-dark flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-finance" />
            Financial Advisor AI
            <Sparkles className="h-5 w-5 text-finance" />
          </h1>
        </div>
      </header>
      
      <ScrollArea className="flex-1 p-4 overflow-y-auto bg-transparent">
        <div className="max-w-3xl mx-auto space-y-4 px-2 py-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isAi={message.isAi}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-tr-lg rounded-br-lg rounded-bl-lg border border-gray-100 shadow-sm"
                style={{ borderRadius: "18px 18px 18px 0" }}>
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
      
      <div className="border-t z-10">
        <div className="max-w-3xl mx-auto w-full">
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
