'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Header from '@/components/shared/Header';
import AgentList from '@/components/agents/AgentList';
import ChatContainer from '@/components/agents/ChatContainer';
import CreateAgentDialog from '@/components/agents/CreateAgentDialog';

interface Agent {
  id: number;
  name: string;
  description: string | null;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;
  memory_enabled: number;
  created_at: string;
  updated_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<number | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
        
        // 如果有 agents 但没有选中的，自动选中第一个
        if (data.agents.length > 0 && !activeAgentId) {
          handleAgentSelect(data.agents[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (agentData: any) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();
      if (data.success && data.agent) {
        setAgents([data.agent, ...agents]);
        setShowCreateDialog(false);
        
        // 自动选中新创建的 agent
        handleAgentSelect(data.agent.id);
      } else {
        alert('创建失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('创建失败');
    }
  };

  const handleAgentSelect = async (agentId: number) => {
    setActiveAgentId(agentId);
    
    // 创建新对话
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId }),
      });

      const data = await response.json();
      if (data.success && data.conversation) {
        setConversationId(data.conversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleNewConversation = async () => {
    if (!activeAgentId) return;
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: activeAgentId }),
      });

      const data = await response.json();
      if (data.success && data.conversation) {
        setConversationId(data.conversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const activeAgent = agents.find(a => a.id === activeAgentId) || null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header
        rightContent={
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>创建 Agent</span>
          </button>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧 Agent 列表 */}
        <div className="w-80 border-r border-gray-200 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">加载中...</div>
            </div>
          ) : (
            <AgentList
              agents={agents}
              activeAgentId={activeAgentId}
              onAgentSelect={handleAgentSelect}
              onCreateAgent={() => setShowCreateDialog(true)}
            />
          )}
        </div>

        {/* 右侧对话区域 */}
        <div className="flex-1">
          <ChatContainer
            agent={activeAgent}
            conversationId={conversationId}
            onNewConversation={handleNewConversation}
          />
        </div>
      </div>

      <CreateAgentDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateAgent}
      />
    </div>
  );
}
