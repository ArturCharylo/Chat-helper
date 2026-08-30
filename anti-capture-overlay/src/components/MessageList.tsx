import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white whitespace-pre-wrap'
                : 'bg-neutral-800 text-neutral-200 border border-neutral-700 font-sans text-xs sm:text-sm'
            }`}
          >
            {msg.role === 'user' ? (
              msg.content
            ) : (
              <ReactMarkdown
                components={{
                  pre: ({ node, ...props }) => (
                    <div className="bg-neutral-900 border border-neutral-700 rounded-md p-2 my-2 overflow-x-auto">
                      <pre {...props} />
                    </div>
                  ),
                  code: ({ node, ...props }) => (
                    <code className="bg-neutral-900 text-blue-300 rounded px-1 py-0.5 text-xs font-mono" {...props} />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-400 animate-pulse">
            Thinking...
          </div>
        </div>
      )}
    </div>
  );
};