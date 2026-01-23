'use client';

import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

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

interface FileTreeNavigationProps {
  tree: TreeNode[];
  selectedFile: ProjectFile | null;
  expandedPaths: Set<string>;
  onSelectFile: (file: ProjectFile) => void;
  filesCount: number;
}

export default function FileTreeNavigation({
  tree,
  selectedFile,
  expandedPaths,
  onSelectFile,
  filesCount,
}: FileTreeNavigationProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderTree = (nodes: TreeNode[], level: number = 0) => {
    return nodes.map(node => (
      <div key={node.file.id}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 ${
            selectedFile?.id === node.file.id ? 'bg-indigo-50' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onSelectFile(node.file)}
        >
          {node.file.is_directory ? (
            <>
              {expandedPaths.has(node.file.file_path) ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-900" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-900" />
              )}
              {expandedPaths.has(node.file.file_path) ? (
                <FolderOpen className="w-4 h-4 flex-shrink-0 text-gray-900" />
              ) : (
                <Folder className="w-4 h-4 flex-shrink-0 text-gray-900" />
              )}
            </>
          ) : (
            <>
              <File className="w-4 h-4 flex-shrink-0 text-gray-900 ml-4" />
            </>
          )}
          <span className="text-sm text-gray-900 truncate">{node.file.file_name}</span>
          {!node.file.is_directory && (
            <span className="text-xs text-gray-400 ml-auto">
              {formatFileSize(node.file.file_size)}
            </span>
          )}
        </div>
        {expandedPaths.has(node.file.file_path) && (
          <div>{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="col-span-3 bg-white rounded-lg shadow overflow-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">文件列表</h2>
        <p className="text-sm text-gray-500 mt-1">
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
          renderTree(tree)
        )}
      </div>
    </div>
  );
}
