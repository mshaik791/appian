'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface MessageBubbleProps {
  content: string;
  speaker: 'student' | 'persona';
  timestamp?: Date;
  isStreaming?: boolean;
}

export function MessageBubble({ content, speaker, timestamp, isStreaming }: MessageBubbleProps) {
  const isStudent = speaker === 'student';
  
  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isStudent ? 'flex-row-reverse' : 'flex-row'
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-xs font-medium',
          isStudent 
            ? 'bg-blue-500 text-white' 
            : 'bg-green-500 text-white'
        )}>
          {isStudent ? 'S' : 'P'}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        'flex flex-col max-w-[80%]',
        isStudent ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-lg px-4 py-2 text-sm',
          isStudent
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        )}>
          <div className="whitespace-pre-wrap">
            {content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
            )}
          </div>
        </div>
        
        {timestamp && (
          <div className={cn(
            'text-xs text-gray-500 mt-1',
            isStudent ? 'text-right' : 'text-left'
          )}>
            {timestamp.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
}
