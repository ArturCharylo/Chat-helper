import { Message } from '../types/chat';

// Streams responses from Groq OpenAI-compatible endpoint
export async function streamChatCompletion(
  messages: Message[],
  apiKey: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      // Fast, high-performance model hosted on Groq
      model: 'openai/gpt-oss-120b',
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: true,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error?.message || response.statusText;
    throw new Error(`Groq API Error (${response.status}): ${errorMessage}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('Response body is unreadable');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') return;

      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices[0]?.delta?.content || '';
          if (content) onChunk(content);
        } catch {
          // Ignore incomplete JSON chunks
        }
      }
    }
  }
}