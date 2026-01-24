'use client';

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

interface TaskFilterBarProps {
  searchText: string;
  setSearchText: (value: string) => void;
  filterProject: string;
  setFilterProject: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterDateFrom: string;
  setFilterDateFrom: (value: string) => void;
  filterDateTo: string;
  setFilterDateTo: (value: string) => void;
  tasks: Task[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export default function TaskFilterBar({
  searchText,
  setSearchText,
  filterProject,
  setFilterProject,
  filterStatus,
  setFilterStatus,
  filterDateFrom,
  setFilterDateFrom,
  filterDateTo,
  setFilterDateTo,
  tasks,
  filteredCount,
  totalCount,
  onClearFilters,
}: TaskFilterBarProps) {
  const hasActiveFilters = searchText || filterProject || filterStatus || filterDateFrom || filterDateTo;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="任务名称或描述"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
          />
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">项目</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
          >
            <option value="">全部项目</option>
            {Array.from(new Set(tasks.map(t => t.project_name).filter(Boolean))).map(projectName => (
              <option key={projectName} value={projectName!}>{projectName}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
          >
            <option value="">全部状态</option>
            <option value="not_started">未开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="abandoned">已放弃</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
          />
        </div>
      </div>

      {/* Filter Summary */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>
          共 {filteredCount} 条任务 
          {filteredCount !== totalCount && ` (已筛选 ${totalCount} 条中的 ${filteredCount} 条)`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-indigo-600 hover:text-indigo-800"
          >
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
}
