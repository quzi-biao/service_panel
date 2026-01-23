'use client';

import { X } from 'lucide-react';
import FileTreeNavigation from './FileTreeNavigation';

interface ProjectFile {
  id: number;
  project_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_md5: string | null;
  is_directory: boolean;
  parent_path: string | null;
}

interface TreeNode {
  file: ProjectFile;
  children: TreeNode[];
  expanded: boolean;
}

interface MobileFileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  tree: TreeNode[];
  selectedFile: ProjectFile | null;
  expandedPaths: Set<string>;
  onSelectFile: (file: ProjectFile) => void;
  onDeleteFile: (file: ProjectFile) => void;
  filesCount: number;
}

export default function MobileFileSidebar({
  isOpen,
  onClose,
  tree,
  selectedFile,
  expandedPaths,
  onSelectFile,
  onDeleteFile,
  filesCount,
}: MobileFileSidebarProps) {
  const handleSelectFile = (file: ProjectFile) => {
    onSelectFile(file);
    // 只有点击文件时才关闭侧边栏，点击目录不关闭
    if (!file.is_directory) {
      onClose();
    }
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
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">文件列表</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 文件树内容 */}
        <div className="h-[calc(100%-64px)] overflow-auto">
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-500">
              共 {filesCount} 个文件
            </p>
          </div>
          <div className="p-2">
            {tree.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无文件</p>
                <p className="text-sm mt-2">点击"扫描文件"按钮开始</p>
              </div>
            ) : (
              <FileTreeNavigation
                tree={tree}
                selectedFile={selectedFile}
                expandedPaths={expandedPaths}
                onSelectFile={handleSelectFile}
                onDeleteFile={onDeleteFile}
                filesCount={filesCount}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
