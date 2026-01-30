'use client';

import { useState, useEffect } from 'react';
import { Plus, Menu } from 'lucide-react';
import Header from '@/components/shared/Header';
import AgentList from '@/components/agents/AgentList';
import ChatContainer from '@/components/agents/ChatContainer';
import CreateAgentDialog from '@/components/agents/CreateAgentDialog';
import EditAgentDialog from '@/components/agents/EditAgentDialog';

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    // 立即清空 conversationId，触发消息列表清空
    setConversationId(null);
    
    // 获取或创建该 Agent 的默认对话
    try {
      const response = await fetch(`/api/agents/${agentId}/conversation`);
      const data = await response.json();
      
      if (data.success && data.conversation) {
        setConversationId(data.conversation.id);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };


  const handleEditAgent = async (agentData: Partial<Agent>) => {
    if (!activeAgentId) return;

    try {
      const response = await fetch(`/api/agents/${activeAgentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();
      if (data.success && data.agent) {
        setAgents(agents.map(a => a.id === activeAgentId ? data.agent : a));
        setShowEditDialog(false);
      } else {
        alert('更新失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      alert('更新失败');
    }
  };

  const activeAgent = agents.find(a => a.id === activeAgentId) || null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header
        rightContent={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden inline-flex items-center px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
              title="Agent 列表"
            >
              <Menu className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              title="创建 Agent"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">创建 Agent</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* 桌面端 Agent 列表 */}
        <div className="hidden md:block w-80 border-r border-gray-200 bg-white">
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

        {/* 移动端侧边栏 */}
        {isMobileSidebarOpen && (
          <>
            {/* 遮罩层 */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* 侧边栏 */}
            <aside className="fixed left-0 top-16 bottom-0 w-80 z-50 md:hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full bg-white">
                  <div className="text-gray-500">加载中...</div>
                </div>
              ) : (
                <AgentList
                  agents={agents}
                  activeAgentId={activeAgentId}
                  onAgentSelect={(agentId) => {
                    handleAgentSelect(agentId);
                    setIsMobileSidebarOpen(false);
                  }}
                  onCreateAgent={() => {
                    setShowCreateDialog(true);
                    setIsMobileSidebarOpen(false);
                  }}
                />
              )}
            </aside>
          </>
        )}

        {/* 对话区域 */}
        <div className="flex-1">
          <ChatContainer
            agent={activeAgent}
            conversationId={conversationId}
            onEditAgent={() => setShowEditDialog(true)}
          />
        </div>
      </div>

      <CreateAgentDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateAgent}
      />

      {activeAgent && (
        <EditAgentDialog
          isOpen={showEditDialog}
          agent={activeAgent}
          onClose={() => setShowEditDialog(false)}
          onSubmit={handleEditAgent}
        />
      )}
    </div>
  );
}
