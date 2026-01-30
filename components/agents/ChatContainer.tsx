'use client';

import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Settings } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface Agent {
  id: number;
  name: string;
  description: string | null;
}

interface ChatContainerProps {
  agent: Agent | null;
  conversationId: number | null;
  onEditAgent: () => void;
}

// 本地缓存键名
const CACHE_KEY_PREFIX = 'agent_messages_';

// 从本地缓存获取消息
const getCachedMessages = (conversationId: number): Message[] | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${conversationId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
};

// 保存消息到本地缓存
const setCachedMessages = (conversationId: number, messages: Message[]) => {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${conversationId}`, JSON.stringify(messages));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
};

export default function ChatContainer({ agent, conversationId, onEditAgent }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 立即清空消息列表
    setMessages([]);
    
    if (conversationId) {
      // 同步从缓存加载（立即显示）
      const cached = getCachedMessages(conversationId);
      if (cached && cached.length > 0) {
        setMessages(cached);
      }
      
      // 异步从接口获取最新数据（后台更新）
      fetchMessages();
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        // 更新本地缓存
        setCachedMessages(conversationId, data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!agent || !conversationId) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agent.id,
          conversation_id: conversationId,
          message: content,
        }),
      });

      const data = await response.json();
      if (data.success && data.message) {
        const newMessages = [...messages, userMessage, data.message];
        setMessages(newMessages);
        // 更新本地缓存
        if (conversationId) {
          setCachedMessages(conversationId, newMessages);
        }
      } else {
        alert('发送失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('发送失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">请选择一个 Agent 开始对话</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-1 border-b border-gray-200 bg-white">
        <div>
          <h2 className="font-semibold text-gray-900">{agent.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEditAgent}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="编辑 Agent"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading || !conversationId} />
    </div>
  );
}
