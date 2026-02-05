'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Server } from '@/types/server';

interface ServerFormDialogProps {
  server?: Server | null;
  onClose: () => void;
  onSubmit: (serverData: any) => void;
}

export default function ServerFormDialog({ server, onClose, onSubmit }: ServerFormDialogProps) {
  const isEdit = !!server;
  
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    private_key: '',
    auth_method: 'password' as 'password' | 'private_key',
    primary_tag: '',
    tags: '',
    description: '',
    network_group: '',
    // 跳板机配置
    bastion_host: '',
    bastion_port: 22,
    bastion_username: '',
    bastion_password: '',
    bastion_private_key: '',
    bastion_auth_method: 'password' as 'password' | 'private_key',
  });

  const [useBastionHost, setUseBastionHost] = useState(false);

  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name || '',
        host: server.host || '',
        port: server.port || 22,
        username: server.username || '',
        password: server.password || '',
        private_key: server.private_key || '',
        auth_method: server.auth_method || 'password',
        primary_tag: server.primary_tag || '',
        tags: server.tags || '',
        description: server.description || '',
        network_group: server.network_group || '',
        bastion_host: server.bastion_host || '',
        bastion_port: server.bastion_port || 22,
        bastion_username: server.bastion_username || '',
        bastion_password: server.bastion_password || '',
        bastion_private_key: server.bastion_private_key || '',
        bastion_auth_method: server.bastion_auth_method || 'password',
      });
      
      // 如果存在跳板机配置，默认勾选
      setUseBastionHost(!!server.bastion_host);
    }
  }, [server]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.host || !formData.username) {
      alert('请填写所有必填字段');
      return;
    }

    if (formData.auth_method === 'password' && !formData.password) {
      alert('请输入密码');
      return;
    }

    if (formData.auth_method === 'private_key' && !formData.private_key) {
      alert('请输入私钥');
      return;
    }

    // 如果启用了跳板机，验证跳板机配置
    if (useBastionHost) {
      if (!formData.bastion_host || !formData.bastion_username) {
        alert('请填写跳板机的主机地址和用户名');
        return;
      }

      if (formData.bastion_auth_method === 'password' && !formData.bastion_password) {
        alert('请输入跳板机密码');
        return;
      }

      if (formData.bastion_auth_method === 'private_key' && !formData.bastion_private_key) {
        alert('请输入跳板机私钥');
        return;
      }
    }

    const submitData: any = {
      ...formData,
      private_key: formData.private_key || null,
      primary_tag: formData.primary_tag || null,
      tags: formData.tags || null,
      description: formData.description || null,
      network_group: formData.network_group || null,
      // 如果未启用跳板机，清空跳板机配置
      bastion_host: useBastionHost ? formData.bastion_host : null,
      bastion_port: useBastionHost ? formData.bastion_port : 22,
      bastion_username: useBastionHost ? formData.bastion_username : null,
      bastion_password: useBastionHost ? formData.bastion_password : null,
      bastion_private_key: useBastionHost ? formData.bastion_private_key : null,
      bastion_auth_method: useBastionHost ? formData.bastion_auth_method : 'password',
    };

    if (isEdit && server) {
      submitData.id = server.id;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? '编辑服务器' : '添加服务器'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    服务器名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="例如: 生产服务器-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主标签
                  </label>
                  <input
                    type="text"
                    value={formData.primary_tag}
                    onChange={(e) => setFormData({ ...formData, primary_tag: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="例如: 生产环境"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    网络分组
                  </label>
                  <input
                    type="text"
                    value={formData.network_group}
                    onChange={(e) => setFormData({ ...formData, network_group: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="例如: ZT-Network-A"
                  />
                  <p className="text-xs text-gray-500 mt-1">用于标识 ZeroTier 网络分组</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    其他标签
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="多个标签用逗号分隔"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="服务器描述信息..."
                />
              </div>
            </div>

            {/* Connection Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">连接信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主机地址 *
                  </label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="例如: 192.168.1.100 或 172.25.0.10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    端口 *
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    用户名 *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    placeholder="例如: root"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    认证方式 *
                  </label>
                  <select
                    value={formData.auth_method}
                    onChange={(e) => setFormData({ ...formData, auth_method: e.target.value as 'password' | 'private_key' })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="password">密码</option>
                    <option value="private_key">私钥</option>
                  </select>
                </div>

                {formData.auth_method === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      密码 *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required={formData.auth_method === 'password'}
                    />
                  </div>
                )}
              </div>

              {formData.auth_method === 'private_key' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    私钥 *
                  </label>
                  <textarea
                    value={formData.private_key}
                    onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                    rows={6}
                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-mono"
                    required={formData.auth_method === 'private_key'}
                  />
                  <p className="text-xs text-gray-500 mt-1">请粘贴完整的私钥内容，包括 BEGIN 和 END 标记</p>
                </div>
              )}
            </div>

            {/* Bastion Host Configuration */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">跳板机配置</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    如果目标服务器在隔离的 ZeroTier 网络中，可以通过跳板机连接
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useBastionHost}
                    onChange={(e) => setUseBastionHost(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {useBastionHost ? '已启用' : '已禁用'}
                  </span>
                </label>
              </div>

              {useBastionHost && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        跳板机地址 *
                      </label>
                      <input
                        type="text"
                        value={formData.bastion_host}
                        onChange={(e) => setFormData({ ...formData, bastion_host: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="例如: bastion.example.com 或 123.45.67.89"
                        required={useBastionHost}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        跳板机端口 *
                      </label>
                      <input
                        type="number"
                        value={formData.bastion_port}
                        onChange={(e) => setFormData({ ...formData, bastion_port: parseInt(e.target.value) })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        required={useBastionHost}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        跳板机用户名 *
                      </label>
                      <input
                        type="text"
                        value={formData.bastion_username}
                        onChange={(e) => setFormData({ ...formData, bastion_username: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="例如: bastion"
                        required={useBastionHost}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        跳板机认证方式 *
                      </label>
                      <select
                        value={formData.bastion_auth_method}
                        onChange={(e) => setFormData({ ...formData, bastion_auth_method: e.target.value as 'password' | 'private_key' })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      >
                        <option value="password">密码</option>
                        <option value="private_key">私钥</option>
                      </select>
                    </div>

                    {formData.bastion_auth_method === 'password' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          跳板机密码 *
                        </label>
                        <input
                          type="password"
                          value={formData.bastion_password}
                          onChange={(e) => setFormData({ ...formData, bastion_password: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                          required={useBastionHost && formData.bastion_auth_method === 'password'}
                        />
                      </div>
                    )}
                  </div>

                  {formData.bastion_auth_method === 'private_key' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        跳板机私钥 *
                      </label>
                      <textarea
                        value={formData.bastion_private_key}
                        onChange={(e) => setFormData({ ...formData, bastion_private_key: e.target.value })}
                        rows={5}
                        placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-mono"
                        required={useBastionHost && formData.bastion_auth_method === 'private_key'}
                      />
                      <p className="text-xs text-gray-500 mt-1">请粘贴跳板机的私钥内容</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isEdit ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  );
}
