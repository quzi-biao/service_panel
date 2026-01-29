'use client';

import { Bot, MessageSquare } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  description: string | null;
  model: string;
  created_at: string;
}

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
  onClick: () => void;
}

export default function AgentCard({ agent, isActive, onClick }: AgentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-50 border-2 border-indigo-500 shadow-md'
          : 'bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
          <Bot className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
            {agent.name}
          </h3>
          {agent.description && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {agent.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">{agent.model}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
