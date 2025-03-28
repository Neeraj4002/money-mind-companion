
import React from 'react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: string;
  isAi: boolean;
}

const ChatMessage = ({ message, isAi }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex",
      isAi ? "justify-start" : "justify-end"
    )}>
      <div 
        className={cn(
          "p-4 rounded-lg mb-4 max-w-[85%] animate-fade-in shadow-md",
          isAi 
            ? "bg-white border border-gray-100" 
            : "bg-gradient-to-br from-finance to-blue-400 text-white"
        )}
        style={{
          borderRadius: isAi ? "18px 18px 18px 0" : "18px 18px 0 18px",
          boxShadow: isAi ? "0 2px 8px rgba(0, 0, 0, 0.05)" : "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}
      >
        {isAi ? (
          <ReactMarkdown
            className="text-sm md:text-base leading-relaxed prose prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 max-w-none"
            components={{
              // Customize styling for different Markdown elements
              strong: ({ node, ...props }) => <span className="font-bold text-finance-dark" {...props} />,
              h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-md font-bold my-1" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
              li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
              a: ({ node, ...props }) => <a className="text-blue-600 underline" {...props} />,
              p: ({ node, ...props }) => <p className="my-1" {...props} />
            }}
          >
            {message}
          </ReactMarkdown>
        ) : (
          <p className="text-sm md:text-base leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
