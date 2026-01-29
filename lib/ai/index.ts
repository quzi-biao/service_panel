// AI Service Factory - 统一的 AI 服务入口

import { AIProvider } from './types';
import { OpenRouterProvider } from './providers/openrouter';

export class AIService {
  private static instance: AIService;
  private provider: AIProvider;

  private constructor() {
    // 默认使用 OpenRouter
    this.provider = new OpenRouterProvider();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  // 可以在未来扩展支持其他 provider
  setProvider(provider: AIProvider) {
    this.provider = provider;
  }
}

export * from './types';
export { OpenRouterProvider } from './providers/openrouter';
