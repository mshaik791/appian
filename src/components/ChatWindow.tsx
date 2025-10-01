'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

interface Message {
  id: string;
  content: string;
  speaker: 'student' | 'persona';
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  streamingMessage?: string;
  className?: string;
}

export function ChatWindow({ messages, streamingMessage, className }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingMessage && (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Start the conversation</div>
              <div className="text-sm">Send a message to begin chatting with the persona</div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            content={message.content}
            speaker={message.speaker}
            timestamp={message.timestamp}
          />
        ))}
        
        {streamingMessage && (
          <MessageBubble
            content={streamingMessage}
            speaker="persona"
            isStreaming={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
