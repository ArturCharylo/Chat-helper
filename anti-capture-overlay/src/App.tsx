import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { Message } from './types/chat';
import { streamChatCompletion } from './services/llm';

export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey] = useState(() => localStorage.getItem('openai_key') || '');

  // Enable native capture exclusion on startup
  useEffect(() => {
    invoke('enable_anti_capture').catch((err) => {
      console.error('Failed to enable anti-capture mode:', err);
    });
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!apiKey) {
      alert('Please set your OpenAI API key in local storage (key: openai_key)');
      return;
    }

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const assistantMessageId = crypto.randomUUID();

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      let accumulatedResponse = '';
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      await streamChatCompletion([...messages, userMessage], apiKey, (chunk) => {
        accumulatedResponse += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedResponse } : msg
          )
        );
      });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950/90 text-white rounded-xl border border-neutral-800 shadow-2xl backdrop-blur-md overflow-hidden">
      <Header/>
      <MessageList isLoading={loading} messages={messages}/>
      <ChatInput disabled={loading} onSend={handleSendMessage}/>
    </div>
  );
};

export default App;
