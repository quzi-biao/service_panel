import { Server, FolderGit2 } from 'lucide-react';

type TabType = 'services' | 'projects';

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onTabChange('services')}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
          activeTab === 'services'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
            : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
        }`}
      >
        <Server className="w-5 h-5" />
        服务管理
      </button>
      <button
        onClick={() => onTabChange('projects')}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
          activeTab === 'projects'
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
            : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
        }`}
      >
        <FolderGit2 className="w-5 h-5" />
        项目管理
      </button>
    </div>
  );
}
