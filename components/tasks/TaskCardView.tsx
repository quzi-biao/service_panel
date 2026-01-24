'use client';

import { useState } from 'react';
import TaskEditDialog from './TaskEditDialog';

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

interface TaskCardViewProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
}

export default function TaskCardView({ tasks, onTaskUpdate }: TaskCardViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTask(null);
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

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'abandoned': 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无任务数据
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="bg-white rounded-lg shadow p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            onClick={() => handleCardClick(task)}
          >
            {/* Task Name and Status Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {task.task_name || '-'}
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>
            </div>

            {/* Task Description */}
            {
              task.task_description && (
                <div className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-2">
                {task.task_description || '-'}
                </div>
              )
            }

            {/* Dates and Project Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-700">{formatDate(task.proposed_time)}-{formatDate(task.completed_time)||'未完成'}</div>
              </div>
              <div>
                <div className="text-gray-700 truncate">{task.project_name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TaskEditDialog
        task={selectedTask}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onUpdate={onTaskUpdate}
      />
    </>
  );
}
