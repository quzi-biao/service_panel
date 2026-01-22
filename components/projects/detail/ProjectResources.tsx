'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Edit2, Save, X, Folder, Plus, Trash2 } from 'lucide-react';

interface Resource {
  resource_name: string;
  resource_description?: string;
}

interface ProjectResourcesProps {
  project: Project;
  onUpdate: (resources: Resource[]) => Promise<void>;
}

const getResourcesFromProject = (project: Project): Resource[] => {
  if (!project.extended_info) return [];
  
  // Handle if extended_info is already an object
  if (typeof project.extended_info === 'object') {
    return (project.extended_info as any).resources || [];
  }
  
  // Handle if extended_info is a JSON string
  try {
    const parsed = JSON.parse(project.extended_info);
    return parsed.resources || [];
  } catch {
    return [];
  }
};

export default function ProjectResources({ project, onUpdate }: ProjectResourcesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [resourceList, setResourceList] = useState<Resource[]>(
    getResourcesFromProject(project)
  );
  const [newResource, setNewResource] = useState<Resource>({
    resource_name: '',
    resource_description: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(resourceList);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setResourceList(getResourcesFromProject(project));
    setNewResource({ resource_name: '', resource_description: '' });
    setIsEditing(false);
  };

  const handleAdd = () => {
    if (newResource.resource_name.trim()) {
      setResourceList([...resourceList, newResource]);
      setNewResource({ resource_name: '', resource_description: '' });
    }
  };

  const handleRemove = (index: number) => {
    const updated = resourceList.filter((_, i) => i !== index);
    setResourceList(updated);
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-gray-200/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">资源</h2>
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
          <div className="space-y-2">
            {resourceList.map((res, index) => (
              <div key={index} className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{res.resource_name}</p>
                  {res.resource_description && (
                    <p className="text-xs text-gray-600 mt-1">{res.resource_description}</p>
                  )}
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
            <p className="text-sm font-medium text-gray-700">添加新资源</p>
            <div>
              <input
                type="text"
                value={newResource.resource_name}
                onChange={(e) => setNewResource({ ...newResource, resource_name: e.target.value })}
                placeholder="资源名称（如：Vue, React）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>
            <div>
              <input
                type="text"
                value={newResource.resource_description}
                onChange={(e) => setNewResource({ ...newResource, resource_description: e.target.value })}
                placeholder="描述（可选）"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
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
          {resourceList.length > 0 ? (
            resourceList.map((res, index) => (
              <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{res.resource_name}</h3>
                {res.resource_description && (
                  <p className="text-xs text-gray-600">{res.resource_description}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">暂无资源信息</p>
          )}
        </div>
      )}
    </div>
  );
}
