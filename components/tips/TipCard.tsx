'use client';

import { useState } from 'react';
import { Copy, Edit2, Trash2, Check, X, Tag } from 'lucide-react';

interface Tip {
  id: number;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

interface TipCardProps {
  tip: Tip;
  onUpdate: (updatedTip: Tip, syncImmediately?: boolean) => void;
  onDelete: (tipId: number) => void;
}

export default function TipCard({ tip, onUpdate, onDelete }: TipCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tip.content);
  const [editTags, setEditTags] = useState(tip.tags || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tip.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSave = async () => {
    const updatedTip = {
      ...tip,
      content: editContent,
      tags: editTags.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // Update immediately in local state (will be synced in background)
    onUpdate(updatedTip, true); // true = sync immediately since user explicitly saved
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/tips/${tip.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        onDelete(tip.id);
      } else {
        alert('删除失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting tip:', error);
      alert('删除失败');
    }
  };

  const handleCancel = () => {
    setEditContent(tip.content);
    setEditTags(tip.tags || '');
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tags = tip.tags ? tip.tags.split(',').filter(t => t.trim()) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 border border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-900"
            rows={4}
            autoFocus
          />
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="例如: 想法, 待办, 重要"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
              {tip.content}
            </p>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>创建: {formatDate(tip.created_at)}</span>
              {tip.updated_at !== tip.created_at && (
                <span>更新: {formatDate(tip.updated_at)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="复制内容"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
