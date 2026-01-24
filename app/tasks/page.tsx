'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import AddTaskDialog from '@/components/tasks/AddTaskDialog';
import TaskFilterBar from '@/components/tasks/TaskFilterBar';
import TaskTable from '@/components/tasks/TaskTable';
import PaginationControls from '@/components/tasks/PaginationControls';
import { Plus, Upload, Filter } from 'lucide-react';

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

interface Project {
  id: number;
  name: string;
}

// 表格列宽配置
const COLUMN_WIDTHS = {
  taskName: { width: '20%' },        // 任务描述
  taskDescription: { width: '50%' }, // 任务记录（最宽）
  projectName: { width: '8%' },     // 关联项目
  status: { width: '8%' },          // 状态
  proposedTime: { width: '7%' },    // 提出时间
  completedTime: { width: '7%' },   // 完成时间
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [tasks, searchText, filterProject, filterStatus, filterDateFrom, filterDateTo]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleAddTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      if (data.success) {
        fetchTasks();
      } else {
        alert('添加任务失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('添加任务失败');
    }
  };



  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/tasks/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert(`导入完成！\n成功: ${data.successCount} 条\n失败: ${data.errorCount} 条`);
        fetchTasks();
      } else {
        alert('导入失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error importing tasks:', error);
      alert('导入失败');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];
    
    // Search filter (task_name and task_description)
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(task => 
        (task.task_name?.toLowerCase().includes(search) || false) ||
        (task.task_description?.toLowerCase().includes(search) || false)
      );
    }
    
    // Project filter
    if (filterProject) {
      filtered = filtered.filter(task => 
        task.project_name === filterProject
      );
    }
    
    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(task => task.status === filterStatus);
    }
    
    // Date range filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.proposed_time);
        return taskDate >= fromDate;
      });
    }
    
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.proposed_time);
        return taskDate <= toDate;
      });
    }
    
    setFilteredTasks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setSearchText('');
    setFilterProject('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        rightContent={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showFilterBar 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">筛选</span>
            </button>
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">添加任务</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">导入任务</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </div>
        }
      />

      <div className="max-w-8xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <>
            {showFilterBar && (
              <TaskFilterBar
                searchText={searchText}
                setSearchText={setSearchText}
                filterProject={filterProject}
                setFilterProject={setFilterProject}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterDateFrom={filterDateFrom}
                setFilterDateFrom={setFilterDateFrom}
                filterDateTo={filterDateTo}
                setFilterDateTo={setFilterDateTo}
                tasks={tasks}
                filteredCount={filteredTasks.length}
                totalCount={tasks.length}
                onClearFilters={handleClearFilters}
              />
            )}

            <div className="w-full bg-white rounded-lg shadow overflow-hidden">
              <TaskTable tasks={paginatedTasks} onTaskUpdate={fetchTasks} />
              
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={filteredTasks.length}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      <AddTaskDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
