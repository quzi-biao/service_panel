'use client';

import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  primary_tag: string | null;
  tags: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ServerInfoProps {
  server: Server;
  onUpdateServer: (server: Server) => void;
}

export default function ServerInfo({ server, onUpdateServer }: ServerInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: server.name,
    host: server.host,
    port: server.port,
    username: server.username,
    password: server.password,
    primary_tag: server.primary_tag || '',
    tags: server.tags || '',
    description: server.description || '',
  });

  const handleSave = () => {
    onUpdateServer({
      ...server,
      ...formData,
      primary_tag: formData.primary_tag || null,
      tags: formData.tags || null,
      description: formData.description || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.password,
      primary_tag: server.primary_tag || '',
      tags: server.tags || '',
      description: server.description || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">服务器信息</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              编辑
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                取消
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  服务器名称 *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{server.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主标签
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.primary_tag}
                    onChange={(e) => setFormData({ ...formData, primary_tag: e.target.value })}
                    placeholder="例如: 生产环境"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{server.primary_tag || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Connection Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">连接信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主机地址 *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{server.host}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  端口 *
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{server.port}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名 *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">{server.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码 *
                </label>
                {isEditing ? (
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                ) : (
                  <p className="text-gray-900">••••••••</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              其他标签
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="多个标签用逗号分隔，例如: web,nginx,cdn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            ) : (
              <p className="text-gray-900">{server.tags || '-'}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">多个标签用逗号分隔</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                placeholder="服务器描述信息..."
              />
            ) : (
              <p className="text-gray-900 whitespace-pre-wrap">{server.description || '-'}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">创建时间：</span>
                <span className="text-gray-900">{new Date(server.created_at).toLocaleString('zh-CN')}</span>
              </div>
              <div>
                <span className="text-gray-500">更新时间：</span>
                <span className="text-gray-900">{new Date(server.updated_at).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
