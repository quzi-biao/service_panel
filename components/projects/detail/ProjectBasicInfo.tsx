'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { Edit2, Save, X, Pin, Calendar } from 'lucide-react';
import ProjectTypeSelect from '../ProjectTypeSelect';

interface ProjectType {
  id: number;
  name: string;
  sort_order: number;
}

interface ProjectBasicInfoProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => Promise<void>;
  onEditingChange?: (isEditing: boolean) => void;
}

export default function ProjectBasicInfo({ project, onUpdate, onEditingChange }: ProjectBasicInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: project.name,
    project_type: project.project_type,
    description: project.description || '',
  });
  const [saving, setSaving] = useState(false);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  useEffect(() => {
    setFormData({
      name: project.name,
      project_type: project.project_type,
      description: project.description || '',
    });
  }, [project]);

  const fetchProjectTypes = async () => {
    try {
      const response = await fetch('/api/project-types');
      if (response.ok) {
        const data = await response.json();
        setProjectTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch project types:', error);
    }
  };

  const getTypeName = (typeId: string | number | null): string => {
    if (!typeId) return '未分类';
    const type = projectTypes.find(t => t.id.toString() === typeId.toString());
    return type ? type.name : '未分类';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(formData);
      setIsEditing(false);
      onEditingChange?.(false);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: project.name,
      project_type: project.project_type,
      description: project.description || '',
    });
    setIsEditing(false);
    onEditingChange?.(false);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目类型</label>
                <ProjectTypeSelect
                  value={formData.project_type}
                  onChange={(typeId) => setFormData({ ...formData, project_type: typeId.toString() })}
                  placeholder="请选择项目类型"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
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
            <>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {project.name}
                </h1>
                {project.is_pinned && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Pin className="w-3 h-3 fill-current" />
                    置顶
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-lg">
                  {getTypeName(project.project_type)}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
              )}
            </>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              onEditingChange?.(true);
            }}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <div>
            <p className="text-xs text-gray-500">创建时间</p>
            <p className="text-sm font-medium">{new Date(project.created_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <div>
            <p className="text-xs text-gray-500">更新时间</p>
            <p className="text-sm font-medium">{new Date(project.updated_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
