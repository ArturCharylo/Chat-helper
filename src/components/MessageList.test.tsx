import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MessageList } from './MessageList';
import { Message } from '../types/chat';

describe('MessageList', () => {
  it('renders correctly with no messages', () => {
    render(<MessageList messages={[]} isLoading={false} />);
    expect(screen.queryByText('Thinking...')).not.toBeInTheDocument();
  });

  it('renders loading indicator when isLoading is true', () => {
    render(<MessageList messages={[]} isLoading={true} />);
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('renders user messages correctly', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello AI' }
    ];
    render(<MessageList messages={messages} isLoading={false} />);

    const userMessage = screen.getByText('Hello AI');
    expect(userMessage).toBeInTheDocument();
    expect(userMessage.closest('div')).toHaveClass('bg-blue-600');
  });

  it('renders assistant messages correctly and parses markdown', () => {
    const messages: Message[] = [
      { id: '1', role: 'assistant', content: 'Here is some **bold text** and a `code block`' }
    ];
    render(<MessageList messages={messages} isLoading={false} />);

    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('bold text').tagName).toBe('STRONG');
    expect(screen.getByText('code block')).toBeInTheDocument();
    expect(screen.getByText('code block').tagName).toBe('CODE');
  });

  it('renders both user and assistant messages', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there!' }
    ];
    render(<MessageList messages={messages} isLoading={false} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
});
