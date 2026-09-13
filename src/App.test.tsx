import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

// Mock child components to isolate App logic
vi.mock('./components/Header', () => ({
  Header: () => <div data-testid="header" />
}));

vi.mock('./components/MessageList', () => ({
  MessageList: ({ messages, isLoading }: any) => (
    <div data-testid="message-list" data-loading={isLoading}>
      {messages.map((m: any) => (
        <div key={m.id} data-testid={`message-${m.role}`}>
          {m.content}
        </div>
      ))}
    </div>
  )
}));

vi.mock('./components/ChatInput', () => ({
  ChatInput: ({ onSend, disabled }: any) => (
    <div data-testid="chat-input" data-disabled={disabled}>
      <button
        onClick={() => onSend('Test message')}
        disabled={disabled}
        data-testid="send-button"
      >
        Send
      </button>
    </div>
  )
}));

// Mock Tauri API
const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: any[]) => mockInvoke(...args)
}));

// Mock LLM service
const mockStreamChatCompletion = vi.fn();
vi.mock('./services/llm', () => ({
  streamChatCompletion: (...args: any[]) => mockStreamChatCompletion(...args)
}));

describe('App', () => {
  beforeEach(() => {
    mockInvoke.mockResolvedValue(undefined);
    mockStreamChatCompletion.mockImplementation(async (messages, apiKey, onChunk) => {
      onChunk('Response');
      onChunk(' from AI');
    });
    vi.stubGlobal('prompt', vi.fn());

    // Clear localStorage
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders all main components', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  it('calls enable_anti_capture on mount', () => {
    render(<App />);
    expect(mockInvoke).toHaveBeenCalledWith('enable_anti_capture');
  });

  it('initializes apiKey from localStorage', async () => {
    window.localStorage.setItem('openai_key', 'stored-key');
    render(<App />);

    // We can't easily assert on the state directly, but we can verify it doesn't prompt
    const promptMock = vi.mocked(window.prompt);

    const sendButton = screen.getByTestId('send-button');
    await userEvent.click(sendButton);

    expect(promptMock).not.toHaveBeenCalled();
  });

  it('prompts for apiKey if not set in localStorage and saves it', async () => {
    const promptMock = vi.mocked(window.prompt).mockReturnValue('new-key');

    render(<App />);

    const sendButton = screen.getByTestId('send-button');
    await userEvent.click(sendButton);

    expect(promptMock).toHaveBeenCalledWith('Enter your OpenAI API key:');
    expect(window.localStorage.getItem('openai_key')).toBe('new-key');
  });

  it('aborts sending message if prompt is cancelled', async () => {
    const promptMock = vi.mocked(window.prompt).mockReturnValue(null);

    render(<App />);

    const sendButton = screen.getByTestId('send-button');
    await userEvent.click(sendButton);

    expect(mockStreamChatCompletion).not.toHaveBeenCalled();
    // Message list should be empty
    expect(screen.queryByTestId('message-user')).not.toBeInTheDocument();
  });

  it('handles sending a message and streaming the response', async () => {
    window.localStorage.setItem('openai_key', 'test-key');

    render(<App />);

    const sendButton = screen.getByTestId('send-button');
    await act(async () => {
      await userEvent.click(sendButton);
    });

    // Check user message was added
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Check loading state was toggled during the call (it might resolve too fast to catch, but we verify end state)
    await waitFor(() => {
      expect(mockStreamChatCompletion).toHaveBeenCalled();
    });

    // Check assistant message was added with streamed content
    expect(screen.getByText('Response from AI')).toBeInTheDocument();
  });

  it('handles errors from streamChatCompletion gracefully', async () => {
    window.localStorage.setItem('openai_key', 'test-key');
    mockStreamChatCompletion.mockRejectedValueOnce(new Error('API Error'));

    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    const sendButton = screen.getByTestId('send-button');
    await act(async () => {
      await userEvent.click(sendButton);
    });

    expect(consoleErrorMock).toHaveBeenCalledWith('Chat error:', expect.any(Error));

    // Ensure loading state is reset
    const messageList = screen.getByTestId('message-list');
    expect(messageList).toHaveAttribute('data-loading', 'false');
  });
});
