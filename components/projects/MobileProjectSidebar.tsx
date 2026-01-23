'use client';

import { X } from 'lucide-react';
import ProjectNavigation from './ProjectNavigation';

interface MobileProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId: string | null;
  onProjectChange: (projectId: number) => void;
}

export default function MobileProjectSidebar({
  isOpen,
  onClose,
  currentProjectId,
  onProjectChange,
}: MobileProjectSidebarProps) {
  const handleProjectChange = (projectId: number) => {
    onProjectChange(projectId);
    onClose(); // 选择项目后自动关闭侧边栏
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="font-semibold text-gray-900">项目列表</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 项目导航内容 */}
        <div className="h-[calc(100%-64px)] overflow-auto">
          <ProjectNavigation 
            currentProjectId={currentProjectId || ''} 
            onProjectChange={handleProjectChange}
          />
        </div>
      </div>
    </>
  );
}
