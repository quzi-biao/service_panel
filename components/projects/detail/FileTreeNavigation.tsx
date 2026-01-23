'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Trash2, Network } from 'lucide-react';

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
  onDeleteFile: (file: ProjectFile) => void;
  filesCount: number;
  projectId: string;
  onNavigateToGraph?: () => void;
}

export default function FileTreeNavigation({
  tree,
  selectedFile,
  expandedPaths,
  onSelectFile,
  onDeleteFile,
  filesCount,
  projectId,
  onNavigateToGraph,
}: FileTreeNavigationProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: ProjectFile } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: ProjectFile) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu) {
      onDeleteFile(contextMenu.file);
      setContextMenu(null);
    }
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 获取合并后的显示名称和最终节点
  const getCollapsedPath = (node: TreeNode): { displayName: string; finalNode: TreeNode } => {
    if (!node.file.is_directory) {
      return { displayName: node.file.file_name, finalNode: node };
    }

    const pathParts: string[] = [node.file.file_name];
    let currentNode = node;

    // 当当前节点是目录，且只有一个子节点，且该子节点也是目录时，继续合并
    while (
      currentNode.children.length === 1 &&
      currentNode.children[0].file.is_directory
    ) {
      currentNode = currentNode.children[0];
      pathParts.push(currentNode.file.file_name);
    }

    return {
      displayName: pathParts.join('/'),
      finalNode: currentNode
    };
  };

  const renderTree = (nodes: TreeNode[], level: number = 0) => {
    return nodes.map(node => {
      const { displayName, finalNode } = getCollapsedPath(node);
      const isExpanded = expandedPaths.has(node.file.file_path);
      
      return (
        <div key={node.file.id}>
          <div
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-gray-100 ${
              selectedFile?.id === node.file.id ? 'bg-indigo-50' : ''
            }`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => onSelectFile(node.file)}
            onContextMenu={(e) => handleContextMenu(e, node.file)}
          >
            {node.file.is_directory ? (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-900" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-900" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                ) : (
                  <Folder className="w-4 h-4 flex-shrink-0 text-indigo-600" />
                )}
              </>
            ) : (
              <>
                <File className="w-4 h-4 flex-shrink-0 text-gray-900 ml-4" />
              </>
            )}
            <span className="text-sm text-gray-900 truncate">{displayName}</span>
            {!node.file.is_directory && (
              <span className="text-xs text-gray-400 ml-auto">
                {formatFileSize(node.file.file_size)}
              </span>
            )}
          </div>
          {isExpanded && (
            <div>{renderTree(finalNode.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <div className="h-full bg-white rounded-lg shadow flex flex-col overflow-hidden" onClick={handleCloseContextMenu}>
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">文件列表</h2>
            <p className="text-sm text-gray-500 mt-1">
              共 {filesCount} 个文件
            </p>
          </div>
          {onNavigateToGraph && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToGraph();
              }}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="文件关系图谱"
            >
              <Network className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <div className="min-w-max">
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
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleCloseContextMenu}
          />
          <div
            className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]"
            style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          >
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除{contextMenu.file.is_directory ? '目录' : '文件'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
