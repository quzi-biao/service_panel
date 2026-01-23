'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { Edit2, Save, X, Server, ExternalLink, Terminal } from 'lucide-react';

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

  useEffect(() => {
    setFormData({
      project_url: project.project_url || '',
      dev_device_name: project.dev_device_name || '',
      dev_device_path: project.dev_device_path || '',
      deploy_server: project.deploy_server || '',
      service_urls: project.service_urls || '',
    });
  }, [project]);

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

  const handleOpenInTerminal = async (path: string) => {
    // 检查是否在 Electron 环境中
    if (typeof window !== 'undefined' && window.electron?.isElectron) {
      try {
        // 使用 Electron IPC 打开终端
        await window.electron.openTerminal(path);
        return;
      } catch (error) {
        console.error('Failed to open terminal:', error);
        alert('打开终端失败，请检查路径是否正确');
        return;
      }
    }

    // 非 Electron 环境：复制路径并提示用户
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('mac')) {
      instructions = '请按 Cmd+Space 搜索 "终端" 打开，然后粘贴路径';
    } else if (userAgent.includes('win')) {
      instructions = '请按 Win+R 输入 cmd 打开命令提示符，然后粘贴路径';
    } else {
      instructions = '请按 Ctrl+Alt+T 打开终端，然后粘贴路径';
    }

    try {
      await navigator.clipboard.writeText(`cd "${path}"`);
      alert(`路径已复制到剪贴板:\ncd "${path}"\n\n${instructions}\n\n💡 提示：使用 Electron 桌面应用可直接打开终端`);
    } catch (err) {
      alert(`请手动在终端中执行:\ncd "${path}"\n\n${instructions}`);
    }
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
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
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
                className="text-indigo-600 hover:text-indigo-700 break-all text-sm"
              >
                {project.project_url}
              </a>
            </div>
          )}
          {project.dev_device_path && (
            <div>
              <p className="text-xs text-gray-500 mb-1">
                本地路径
                {project.dev_device_name && (
                  <span className="ml-1 text-gray-400">({project.dev_device_name})</span>
                )}
              </p>
              <button
                onClick={() => handleOpenInTerminal(project.dev_device_path!)}
                className="w-full text-left text-xs font-mono text-gray-700 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg break-all transition-colors group flex items-center gap-2"
                title="点击在终端中打开"
              >
                <Terminal className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                <span className="flex-1">{project.dev_device_path}</span>
              </button>
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
