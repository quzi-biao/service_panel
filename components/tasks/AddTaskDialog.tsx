'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import ProjectSelector from '@/components/shared/ProjectSelector';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: {
    task_name: string;
    task_description: string;
    project_id: number | null;
    project_name: string;
    status: string;
  }) => void;
}

export default function AddTaskDialog({ isOpen, onClose, onSubmit }: AddTaskDialogProps) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState('not_started');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      task_name: taskName,
      task_description: taskDescription,
      project_id: projectId,
      project_name: projectName,
      status,
    });

    setTaskName('');
    setTaskDescription('');
    setProjectId(null);
    setProjectName('');
    setStatus('not_started');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">添加任务</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务名称
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="请输入任务名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="请输入任务描述"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关联项目
            </label>
            <ProjectSelector
              value={projectId}
              onChange={(id, name) => {
                setProjectId(id);
                setProjectName(name || '');
              }}
              placeholder="选择关联项目"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务状态
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="not_started">未开始</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="abandoned">已放弃</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              添加任务
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
