'use client';

import { useState, useEffect } from 'react';
import { X, Edit2, Save } from 'lucide-react';
import type { Server } from '@/types/server';

interface ServerInfoModalProps {
  server: Server;
  onClose: () => void;
  onUpdate: (server: Server) => void;
}

export default function ServerInfoModal({ server, onClose, onUpdate }: ServerInfoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: server.name,
    host: server.host,
    port: server.port,
    username: server.username,
    password: server.password,
    private_key: server.private_key || '',
    auth_method: server.auth_method || 'password' as 'password' | 'private_key',
    primary_tag: server.primary_tag || '',
    tags: server.tags || '',
    description: server.description || '',
  });

  useEffect(() => {
    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.password,
      private_key: server.private_key || '',
      auth_method: server.auth_method || 'password',
      primary_tag: server.primary_tag || '',
      tags: server.tags || '',
      description: server.description || '',
    });
    setIsEditing(false);
  }, [server]);

  const handleSave = async () => {
    const updatedServer = {
      ...server,
      ...formData,
      private_key: formData.private_key || null,
      primary_tag: formData.primary_tag || null,
      tags: formData.tags || null,
      description: formData.description || null,
    };
    
    await onUpdate(updatedServer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username,
      password: server.password,
      private_key: server.private_key || '',
      auth_method: server.auth_method || 'password',
      primary_tag: server.primary_tag || '',
      tags: server.tags || '',
      description: server.description || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">服务器信息</h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                编辑
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
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
                    认证方式 *
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.auth_method}
                      onChange={(e) => setFormData({ ...formData, auth_method: e.target.value as 'password' | 'private_key' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    >
                      <option value="password">密码</option>
                      <option value="private_key">私钥</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{server.auth_method === 'private_key' ? '私钥' : '密码'}</p>
                  )}
                </div>

                {formData.auth_method === 'password' && (
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
                )}
              </div>

              {formData.auth_method === 'private_key' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    私钥 *
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.private_key}
                      onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                      rows={8}
                      placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-mono text-xs"
                    />
                  ) : (
                    <p className="text-gray-900 font-mono text-xs bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap break-all">
                      {server.private_key ? '••••••••' : '-'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">请粘贴完整的私钥内容，包括 BEGIN 和 END 标记</p>
                </div>
              )}
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
    </div>
  );
}
