'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Edit2, Save, X, Code, ExternalLink } from 'lucide-react';

interface ProjectGitInfoProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => Promise<void>;
}

export default function ProjectGitInfo({ project, onUpdate }: ProjectGitInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    project_url: project.project_url || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      project_url: project.project_url || '',
    });
    setIsEditing(false);
  };

  if (!project.project_url && !isEditing) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Git 仓库</h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Git 地址</label>
            <input
              type="text"
              value={formData.project_url}
              onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
              placeholder="git@github.com:username/repo.git"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
            />
          </div>
          <div className="flex gap-2">
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
        <a
          href={project.project_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 break-all group text-sm"
        >
          <span className="flex-1">{project.project_url}</span>
          <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </a>
      )}
    </div>
  );
}
