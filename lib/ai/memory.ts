// Memory 和 Context 管理

import { Message } from './types';

export interface ConversationMemory {
  messages: Message[];
  maxMessages: number;
  contextWindow: number;
}

export class MemoryManager {
  /**
   * 管理对话上下文，确保不超过 token 限制
   */
  static buildContext(
    systemPrompt: string,
    conversationHistory: Message[],
    maxContextWindow: number = 4000
  ): Message[] {
    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    // 简单的 token 估算：约 4 个字符 = 1 token
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);
    
    let currentTokens = estimateTokens(systemPrompt);
    const maxTokens = maxContextWindow * 0.7; // 留 30% 空间给回复

    // 从最新的消息开始添加，确保最近的对话被保留
    const reversedHistory = [...conversationHistory].reverse();
    const includedMessages: Message[] = [];

    for (const msg of reversedHistory) {
      const msgTokens = estimateTokens(msg.content);
      if (currentTokens + msgTokens > maxTokens) {
        break;
      }
      includedMessages.unshift(msg);
      currentTokens += msgTokens;
    }

    messages.push(...includedMessages);
    return messages;
  }

  /**
   * 提取对话摘要（用于长期记忆）
   */
  static summarizeConversation(messages: Message[]): string {
    // 简单实现：提取关键信息
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    return `对话包含 ${userMessages.length} 条用户消息和 ${assistantMessages.length} 条助手回复。`;
  }

  /**
   * 清理旧消息，保留最近的 N 条
   */
  static pruneMessages(messages: Message[], keepLast: number = 20): Message[] {
    if (messages.length <= keepLast) {
      return messages;
    }
    return messages.slice(-keepLast);
  }
}
