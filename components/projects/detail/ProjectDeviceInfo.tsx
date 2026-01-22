'use client';

import { useState } from 'react';
import { Project } from '@/types/project';
import { Edit2, Save, X, Server, ExternalLink } from 'lucide-react';

interface ProjectDeviceInfoProps {
  project: Project;
  onUpdate: (data: Partial<Project>) => Promise<void>;
}

export default function ProjectDeviceInfo({ project, onUpdate }: ProjectDeviceInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    project_url: project.project_url || '',
    dev_device_name: project.dev_device_name || '',
    dev_device_path: project.dev_device_path || '',
    deploy_server: project.deploy_server || '',
    service_urls: project.service_urls || '',
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
      dev_device_name: project.dev_device_name || '',
      dev_device_path: project.dev_device_path || '',
      deploy_server: project.deploy_server || '',
      service_urls: project.service_urls || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-gray-200/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Git 仓库 & 设备部署</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">设备名称</label>
            <input
              type="text"
              value={formData.dev_device_name}
              onChange={(e) => setFormData({ ...formData, dev_device_name: e.target.value })}
              placeholder="MAC电脑"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本地路径</label>
            <input
              type="text"
              value={formData.dev_device_path}
              onChange={(e) => setFormData({ ...formData, dev_device_path: e.target.value })}
              placeholder="/Users/username/projects/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">部署服务器</label>
            <input
              type="text"
              value={formData.deploy_server}
              onChange={(e) => setFormData({ ...formData, deploy_server: e.target.value })}
              placeholder="server.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服务地址</label>
            <input
              type="text"
              value={formData.service_urls}
              onChange={(e) => setFormData({ ...formData, service_urls: e.target.value })}
              placeholder="https://example.com"
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
        <div className="space-y-3">
          {project.project_url && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Git 仓库</p>
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 break-all group text-sm"
              >
                <span className="flex-1">{project.project_url}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}
          {project.dev_device_name && (
            <div>
              <p className="text-xs text-gray-500 mb-1">设备名称</p>
              <p className="text-sm font-medium text-gray-800">{project.dev_device_name}</p>
            </div>
          )}
          {project.dev_device_path && (
            <div>
              <p className="text-xs text-gray-500 mb-1">本地路径</p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg break-all">
                {project.dev_device_path}
              </p>
            </div>
          )}
          {project.deploy_server && (
            <div>
              <p className="text-xs text-gray-500 mb-1">部署服务器</p>
              <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg break-all">
                {project.deploy_server}
              </p>
            </div>
          )}
          {project.service_urls && (
            <div>
              <p className="text-xs text-gray-500 mb-1">服务地址</p>
              <p className="text-sm text-gray-700 break-all">{project.service_urls}</p>
            </div>
          )}
          {!project.project_url && !project.dev_device_name && !project.dev_device_path && !project.deploy_server && !project.service_urls && (
            <p className="text-sm text-gray-500">暂无Git仓库和设备部署信息</p>
          )}
        </div>
      )}
    </div>
  );
}
