import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamChatCompletion } from './llm';
import { Message } from '../types/chat';

describe('streamChatCompletion', () => {
  const mockMessages: Message[] = [{ id: '1', role: 'user', content: 'Hello' }];
  const mockApiKey = 'test-key';

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('successfully streams chunks', async () => {
    const onChunk = vi.fn();
    const encoder = new TextEncoder();

    // Create a mock stream
    const chunks = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      'data: [DONE]\n\n'
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: encoder.encode(chunks[chunkIndex++]) });
        }
        return Promise.resolve({ done: true, value: undefined });
      })
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    await streamChatCompletion(mockMessages, mockApiKey, onChunk);

    expect(fetch).toHaveBeenCalledWith('https://api.groq.com/openai/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key',
      }
    }));

    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onChunk).toHaveBeenNthCalledWith(2, ' world');
  });

  it('handles API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    await expect(streamChatCompletion(mockMessages, mockApiKey, vi.fn())).rejects.toThrow('Groq API Error (401): Invalid API key');
  });

  it('handles missing response body', async () => {
    const mockResponse = {
      ok: true,
      body: null
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    await expect(streamChatCompletion(mockMessages, mockApiKey, vi.fn())).rejects.toThrow('Response body is unreadable');
  });

  it('ignores incomplete JSON chunks and non-data lines', async () => {
    const onChunk = vi.fn();
    const encoder = new TextEncoder();

    const chunks = [
      ': ping\n', // SSE comment
      'data: {"choices":[{"delta":{"content":"Test"}}\n', // Incomplete JSON
      'data: {"choices":[{"delta":{"content":"Success"}}]}\n\n', // Complete JSON
      'data: [DONE]\n\n'
    ];

    let chunkIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIndex < chunks.length) {
          return Promise.resolve({ done: false, value: encoder.encode(chunks[chunkIndex++]) });
        }
        return Promise.resolve({ done: true, value: undefined });
      })
    };

    const mockResponse = {
      ok: true,
      body: {
        getReader: () => mockReader
      }
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    await streamChatCompletion(mockMessages, mockApiKey, onChunk);

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk).toHaveBeenCalledWith('Success');
  });
});
