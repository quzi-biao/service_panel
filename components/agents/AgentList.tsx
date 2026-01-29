'use client';

import { Plus } from 'lucide-react';
import AgentCard from './AgentCard';

interface Agent {
  id: number;
  name: string;
  description: string | null;
  model: string;
  created_at: string;
}

interface AgentListProps {
  agents: Agent[];
  activeAgentId: number | null;
  onAgentSelect: (agentId: number) => void;
  onCreateAgent: () => void;
}

export default function AgentList({ agents, activeAgentId, onAgentSelect, onCreateAgent }: AgentListProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">还没有 Agent</p>
            <button
              onClick={onCreateAgent}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              创建第一个 Agent
            </button>
          </div>
        ) : (
          agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isActive={agent.id === activeAgentId}
              onClick={() => onAgentSelect(agent.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
