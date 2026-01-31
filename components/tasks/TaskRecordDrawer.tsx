'use client';

import { useState, useEffect } from 'react';
import { X, Save, Copy, Check } from 'lucide-react';

interface TaskRecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  mode: 'view' | 'edit';
  onSave?: (content: string) => void;
}

export default function TaskRecordDrawer({ isOpen, onClose, content, mode, onSave }: TaskRecordDrawerProps) {
  const [editContent, setEditContent] = useState(content);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEditContent(content);
  }, [content]);

  const handleSave = () => {
    if (onSave) {
      onSave(editContent);
    }
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mode === 'edit' ? editContent : content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b bg-gray-50 pl-4">
          <h4 className="font-semibold text-gray-900">
            {mode === 'edit' ? '编辑任务记录' : '查看任务记录'}
          </h4>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="复制内容"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            {mode === 'edit' && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                保存
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'edit' ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900 font-mono text-sm"
              placeholder="输入任务记录..."
              autoFocus
            />
          ) : (
            <div className="w-full h-full px-4 py-3 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap break-words text-gray-900 font-mono text-sm">
                {content || '暂无内容'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
