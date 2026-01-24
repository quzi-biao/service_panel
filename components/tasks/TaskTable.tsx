'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import ProjectSelector from '@/components/shared/ProjectSelector';

interface Task {
  id: number;
  task_name: string | null;
  task_description: string | null;
  proposed_time: string;
  completed_time: string | null;
  project_id: number | null;
  project_name: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

interface TaskTableProps {
  tasks: Task[];
  onTaskUpdate: (updatedTask: Task) => void;
  onTaskAdd?: (taskData: any) => Promise<void>;
  onTaskDelete?: (taskId: number) => Promise<void>;
  isAddingTask?: boolean;
  onCancelAdd?: () => void;
}

const COLUMN_WIDTHS = {
  taskName: { width: '20%' },
  taskDescription: { width: '45%' },
  projectName: { width: '13%' },
  status: { width: '8%' },
  proposedTime: { width: '7%' },
  completedTime: { width: '7%' },
};

export default function TaskTable({ tasks, onTaskUpdate, onTaskAdd, onTaskDelete, isAddingTask = false, onCancelAdd }: TaskTableProps) {
  const [editingCell, setEditingCell] = useState<{ taskId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  
  // New task row states
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskProjectId, setNewTaskProjectId] = useState<number | null>(null);
  const [newTaskProjectName, setNewTaskProjectName] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('not_started');

  const handleSaveNewTask = async () => {
    if (!newTaskName.trim()) {
      handleCancelNewTask();
      return;
    }

    if (onTaskAdd) {
      await onTaskAdd({
        task_name: newTaskName,
        task_description: newTaskDescription,
        project_id: newTaskProjectId,
        project_name: newTaskProjectName,
        status: newTaskStatus,
      });
      
      // Reset form
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskProjectId(null);
      setNewTaskProjectName('');
      setNewTaskStatus('not_started');
    }
  };

  const handleCancelNewTask = () => {
    setNewTaskName('');
    setNewTaskDescription('');
    setNewTaskProjectId(null);
    setNewTaskProjectName('');
    setNewTaskStatus('not_started');
    if (onCancelAdd) {
      onCancelAdd();
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    if (onTaskDelete) {
      await onTaskDelete(taskId);
      setEditingCell(null);
      setEditValue('');
      setEditProjectId(null);
    }
  };

  const handleCellDoubleClick = (task: Task, field: string) => {
    setEditingCell({ taskId: task.id, field });
    
    if (field === 'task_name') {
      setEditValue(task.task_name || '');
    } else if (field === 'task_description') {
      setEditValue(task.task_description || '');
    } else if (field === 'project_name') {
      setEditProjectId(task.project_id);
      setEditValue(task.project_name || '');
    }
  };

  const handleCellUpdate = async (taskId: number, field: string) => {
    try {
      const updateData: any = {};
      
      if (field === 'task_name') {
        updateData.task_name = editValue;
      } else if (field === 'task_description') {
        updateData.task_description = editValue;
      } else if (field === 'project_name') {
        updateData.project_id = editProjectId;
        updateData.project_name = editValue;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success && data.task) {
        onTaskUpdate(data.task);
      } else {
        alert('更新任务失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('更新任务失败');
    } finally {
      setEditingCell(null);
      setEditValue('');
      setEditProjectId(null);
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
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full" style={{ tableLayout: 'fixed' }}>
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={COLUMN_WIDTHS.taskName}>
              任务描述
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={COLUMN_WIDTHS.taskDescription}>
              任务记录
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={COLUMN_WIDTHS.status}>
              状态
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={COLUMN_WIDTHS.projectName}>
              关联项目
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={COLUMN_WIDTHS.proposedTime}>
              提出时间
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={COLUMN_WIDTHS.completedTime}>
              完成时间
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* New Task Row */}
          {isAddingTask && (
            <tr className="bg-indigo-50 border-2 border-indigo-300">
              {/* Task Name */}
              <td className="px-4 py-3 text-sm" style={COLUMN_WIDTHS.taskName}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="flex-1 px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="输入任务名称..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveNewTask();
                      } else if (e.key === 'Escape') {
                        handleCancelNewTask();
                      }
                    }}
                    onBlur={() => {
                      if (!newTaskName.trim()) {
                        handleCancelNewTask();
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveNewTask}
                    className="p-1 text-green-600 hover:bg-green-50 rounded flex-shrink-0"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelNewTask}
                    className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </td>

              {/* Task Description */}
              <td className="px-4 py-3 text-sm" style={COLUMN_WIDTHS.taskDescription}>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900"
                  placeholder="任务记录..."
                  rows={1}
                />
              </td>

              {/* Status */}
              <td className="px-4 py-3 text-sm" style={COLUMN_WIDTHS.status}>
                <select
                  value={newTaskStatus}
                  onChange={(e) => setNewTaskStatus(e.target.value)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(newTaskStatus)}`}
                >
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="abandoned">已放弃</option>
                </select>
              </td>

              {/* Project Name */}
              <td className="px-4 py-3 text-sm" style={COLUMN_WIDTHS.projectName}>
                <ProjectSelector
                  value={newTaskProjectId}
                  onChange={(id, name) => {
                    setNewTaskProjectId(id);
                    setNewTaskProjectName(name || '');
                  }}
                  placeholder="选择项目"
                />
              </td>

              {/* Proposed Time */}
              <td className="px-4 py-3 text-sm text-gray-400" style={COLUMN_WIDTHS.proposedTime}>
                -
              </td>

              {/* Completed Time */}
              <td className="px-4 py-3 text-sm text-gray-400" style={COLUMN_WIDTHS.completedTime}>
                -
              </td>
            </tr>
          )}

          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              {/* Task Name */}
              <td
                className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
                style={COLUMN_WIDTHS.taskName}
                onDoubleClick={() => handleCellDoubleClick(task, 'task_name')}
              >
                {editingCell?.taskId === task.id && editingCell?.field === 'task_name' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCellUpdate(task.id, 'task_name');
                        } else if (e.key === 'Escape') {
                          setEditingCell(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleCellUpdate(task.id, 'task_name')}
                      className="p-1 text-green-600 hover:bg-green-50 rounded flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCell(null)}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                      title="删除任务"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <span className="font-medium">{task.task_name}</span>
                )}
              </td>

              {/* Task Description */}
              <td
                className="px-4 py-3 text-sm text-gray-600 cursor-pointer"
                style={COLUMN_WIDTHS.taskDescription}
                onDoubleClick={() => handleCellDoubleClick(task, 'task_description')}
                title={task.task_description || ''}
              >
                {editingCell?.taskId === task.id && editingCell?.field === 'task_description' ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = el.scrollHeight + 'px';
                        }
                      }}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none overflow-hidden"
                      autoFocus
                      rows={Math.max(1, (editValue || '').split('\n').length)}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCellUpdate(task.id, 'task_description');
                        } else if (e.key === 'Escape') {
                          setEditingCell(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleCellUpdate(task.id, 'task_description')}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCell(null)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{task.task_description || '-'}</span>
                )}
              </td>

              {/* Status */}
              <td
                className="px-4 py-3 text-sm"
                style={COLUMN_WIDTHS.status}
              >
                <select
                  value={task.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value;
                    try {
                      const response = await fetch(`/api/tasks/${task.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus }),
                      });
                      const data = await response.json();
                      if (data.success && data.task) {
                        onTaskUpdate(data.task);
                      } else {
                        alert('更新状态失败: ' + data.error);
                      }
                    } catch (error) {
                      console.error('Error updating status:', error);
                      alert('更新状态失败');
                    }
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(task.status)}`}
                >
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="abandoned">已放弃</option>
                </select>
              </td>
              {/* Project Name */}
              <td
                className="px-4 py-3 text-sm text-gray-600 cursor-pointer"
                style={COLUMN_WIDTHS.projectName}
                onDoubleClick={() => handleCellDoubleClick(task, 'project_name')}
              >
                {editingCell?.taskId === task.id && editingCell?.field === 'project_name' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <ProjectSelector
                        value={editProjectId}
                        onChange={(id, name) => {
                          setEditProjectId(id);
                          setEditValue(name || '');
                        }}
                        placeholder="选择项目"
                      />
                    </div>
                    <button
                      onClick={() => handleCellUpdate(task.id, 'project_name')}
                      className="p-1 text-green-600 hover:bg-green-50 rounded flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingCell(null)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  task.project_name || '-'
                )}
              </td>

              {/* Proposed Time */}
              <td className="px-4 py-3 text-sm text-gray-600" style={COLUMN_WIDTHS.proposedTime}>
                {formatDate(task.proposed_time)}
              </td>

              {/* Completed Time */}
              <td className="px-4 py-3 text-sm text-gray-600" style={COLUMN_WIDTHS.completedTime}>
                {formatDate(task.completed_time)}
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                暂无任务数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
