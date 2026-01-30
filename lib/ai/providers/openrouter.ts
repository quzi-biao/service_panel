// OpenRouter AI Provider Implementation

import { AIProvider, ChatCompletionRequest, ChatCompletionResponse } from '../types';

// 配置说明：如果 API Key 失效，请访问 https://openrouter.ai/ 获取新的 API Key
const OPENROUTER_CONFIG = {
  apiKey: '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',
  apiBase: 'https://openrouter.ai/api/v1/chat/completions',
  siteUrl: 'https://conceptmap.app',
};

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter';

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(OPENROUTER_CONFIG.apiBase, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': OPENROUTER_CONFIG.siteUrl,
        'X-Title': 'Dev Panel AI Agent',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
  }

  async *streamChat(request: ChatCompletionRequest): AsyncGenerator<string> {
    const response = await fetch(OPENROUTER_CONFIG.apiBase, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': OPENROUTER_CONFIG.siteUrl,
        'X-Title': 'Dev Panel AI Agent',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}
