'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Edit2, Save, X, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Prompt {
  prompt_content: string;
}

interface ProjectPromptsProps {
  project: Project;
  onUpdate: (prompts: Prompt[]) => Promise<void>;
}

const getPromptsFromProject = (project: Project): Prompt[] => {
  if (!project.extended_info) return [];
  
  // Handle if extended_info is already an object
  if (typeof project.extended_info === 'object') {
    return (project.extended_info as any).prompts || [];
  }
  
  // Handle if extended_info is a JSON string
  try {
    const parsed = JSON.parse(project.extended_info);
    return parsed.prompts || [];
  } catch {
    return [];
  }
};

export default function ProjectPrompts({ project, onUpdate }: ProjectPromptsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [promptList, setPromptList] = useState<Prompt[]>(
    getPromptsFromProject(project)
  );
  const [newPrompt, setNewPrompt] = useState<Prompt>({
    prompt_content: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(promptList);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPromptList(getPromptsFromProject(project));
    setNewPrompt({ prompt_content: '' });
    setIsEditing(false);
  };

  const handleAdd = () => {
    if (newPrompt.prompt_content.trim()) {
      setPromptList([...promptList, newPrompt]);
      setNewPrompt({ prompt_content: '' });
    }
  };

  const handleRemove = (index: number) => {
    const updated = promptList.filter((_, i) => i !== index);
    setPromptList(updated);
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-gray-200/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">提示词</h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            {promptList.map((prompt, index) => (
              <div key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{prompt.prompt_content}</p>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">添加新提示词</p>
            <div>
              <textarea
                value={newPrompt.prompt_content}
                onChange={(e) => setNewPrompt({ prompt_content: e.target.value })}
                placeholder="输入提示词内容..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900 resize-none"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {promptList.length > 0 ? (
            promptList.map((prompt, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{prompt.prompt_content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">暂无提示词信息</p>
          )}
        </div>
      )}
    </div>
  );
}
