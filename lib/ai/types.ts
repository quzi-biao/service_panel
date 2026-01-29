// AI 服务相关类型定义

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIProvider {
  name: string;
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  streamChat?(request: ChatCompletionRequest): AsyncGenerator<string>;
}

export interface AgentConfig {
  id: number;
  name: string;
  description?: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  memory_enabled: boolean;
  metadata?: any;
}
