'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StatusSelector from './StatusSelector';
import ProjectSelector from '@/components/shared/ProjectSelector';

interface Task {
  id: number;
  task_name: string;
  task_description: string | null;
  proposed_time: string;
  completed_time: string | null;
  project_id: number | null;
  project_name: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
}

export default function TaskEditDialog({ task, isOpen, onClose, onUpdate }: TaskEditDialogProps) {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState('');
  const [status, setStatus] = useState<string>('not_started');

  useEffect(() => {
    if (task) {
      setTaskName(task.task_name || '');
      setTaskDescription(task.task_description || '');
      setProjectId(task.project_id);
      setProjectName(task.project_name || '');
      setStatus(task.status);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: taskName,
          task_description: taskDescription,
          project_id: projectId,
          project_name: projectName,
          status,
        }),
      });

      const data = await response.json();
      if (data.success && data.task) {
        onUpdate(data.task);
        onClose();
      } else {
        alert('更新任务失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任务失败');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'abandoned': '已放弃',
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 md:hidden max-h-[85vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">编辑任务</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="请输入任务描述"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务记录
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="请输入任务记录"
              rows={6}
            />
          </div>
                    {/* Project Name */}
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务状态
            </label>
            <StatusSelector
              value={status}
              onChange={setStatus}
            />
          </div>

          {/* Read-only Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                提出时间
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {formatDate(task.proposed_time)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                完成时间
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                {formatDate(task.completed_time)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
