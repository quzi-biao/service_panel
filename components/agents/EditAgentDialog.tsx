'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
}

interface EditAgentDialogProps {
  isOpen: boolean;
  agent: Agent;
  onClose: () => void;
  onSubmit: (agentData: Partial<Agent>) => void;
}

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
  { id: 'google/gemini-pro', name: 'Gemini Pro' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
];

export default function EditAgentDialog({ isOpen, agent, onClose, onSubmit }: EditAgentDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState('openai/gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [contextWindow, setContextWindow] = useState(4000);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description || '');
      setSystemPrompt(agent.system_prompt);
      setModel(agent.model);
      setTemperature(agent.temperature);
      setMaxTokens(agent.max_tokens);
      setContextWindow(agent.context_window);
      setMemoryEnabled(Boolean(agent.memory_enabled));
    }
  }, [agent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !systemPrompt.trim()) {
      alert('请填写 Agent 名称和系统提示词');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      system_prompt: systemPrompt.trim(),
      model,
      temperature,
      max_tokens: maxTokens,
      context_window: contextWindow,
      memory_enabled: memoryEnabled ? 1 : 0,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-2 border-b">
          <h4 className="font-semibold text-gray-900">编辑 AI Agent</h4>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Agent 名称 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Agent 名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="例如：代码助手、写作助手"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              描述
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="简短描述这个 Agent 的用途"
            />
          </div>

          {/* 系统提示词 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              系统提示词 *
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="定义 Agent 的角色、能力和行为规则..."
              rows={5}
              required
            />
          </div>

          {/* 模型选择 - 可搜索和手动输入 */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-700">
                模型
              </label>
              <a
                href="https://openrouter.ai/models"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                浏览更多模型
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <input
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setModelSearchQuery(e.target.value);
                setShowModelDropdown(true);
              }}
              onFocus={() => setShowModelDropdown(true)}
              onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="输入或选择模型..."
            />
            
            {/* 下拉选项 */}
            {showModelDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {AVAILABLE_MODELS
                  .filter(m => 
                    m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                    m.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
                  )
                  .map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setModel(m.id);
                        setModelSearchQuery('');
                        setShowModelDropdown(false);
                      }}
                      className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer text-gray-900"
                    >
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.id}</div>
                    </div>
                  ))}
                {AVAILABLE_MODELS.filter(m => 
                  m.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
                  m.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
                ).length === 0 && modelSearchQuery && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    按 Enter 使用自定义模型: {modelSearchQuery}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 高级设置 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Temperature ({temperature})
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                min="100"
                max="8000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Context Window
              </label>
              <input
                type="number"
                value={contextWindow}
                onChange={(e) => setContextWindow(parseInt(e.target.value))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                min="1000"
                max="128000"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={memoryEnabled}
                  onChange={(e) => setMemoryEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-gray-700">启用记忆功能</span>
              </label>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
