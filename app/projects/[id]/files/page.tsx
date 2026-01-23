'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCw, Loader2 } from 'lucide-react';
import Header from '@/components/shared/Header';
import FileTreeNavigation from '@/components/projects/detail/FileTreeNavigation';
import FileContentViewer from '@/components/projects/detail/FileContentViewer';

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

export default function ProjectFilesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<{ name: string } | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));

  useEffect(() => {
    fetchProject();
    fetchFiles();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/files`);
      const data = await response.json();
      
      // 确保 data 是数组
      const fileList = Array.isArray(data) ? data : [];
      setFiles(fileList);
      buildTree(fileList);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
      setTree([]);
    } finally {
      setLoading(false);
    }
  };

  const scanFiles = async () => {
    try {
      setScanning(true);
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchFiles();
      } else {
        alert('扫描失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('Error scanning files:', error);
      alert('扫描失败');
    } finally {
      setScanning(false);
    }
  };

  const buildTree = (fileList: ProjectFile[]) => {
    const rootNodes: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();

    // 先创建所有节点
    fileList.forEach(file => {
      const node: TreeNode = {
        file,
        children: [],
        expanded: expandedPaths.has(file.file_path)
      };
      nodeMap.set(file.file_path, node);
    });

    // 构建树结构
    fileList.forEach(file => {
      const node = nodeMap.get(file.file_path)!;
      
      if (!file.parent_path || file.parent_path === '') {
        rootNodes.push(node);
      } else {
        const parentNode = nodeMap.get(file.parent_path);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      }
    });

    // 排序：目录在前，文件在后，同类按名称排序
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.file.is_directory && !b.file.is_directory) return -1;
        if (!a.file.is_directory && b.file.is_directory) return 1;
        return a.file.file_name.localeCompare(b.file.file_name);
      });
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootNodes);
    setTree(rootNodes);
  };

  const toggleExpand = (filePath: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedPaths(newExpanded);
    buildTree(files);
  };

  const selectFile = async (file: ProjectFile) => {
    if (file.is_directory) {
      toggleExpand(file.file_path);
      return;
    }

    setSelectedFile(file);
    setLoadingContent(true);
    setFileContent('');

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}/content`);
      const data = await response.json();
      
      if (data.error) {
        setFileContent(`错误: ${data.error}\n${data.message || ''}`);
      } else {
        setFileContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('加载文件内容失败');
    } finally {
      setLoadingContent(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/projects/${projectId}`)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              ← 返回项目详情
            </button>
            <h1 className="text-xl font-bold text-gray-900">{project?.name || '项目文件'}</h1>
          </div>
          
          <button
            onClick={scanFiles}
            disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                扫描中...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                扫描文件
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
            <FileTreeNavigation
              tree={tree}
              selectedFile={selectedFile}
              expandedPaths={expandedPaths}
              onSelectFile={selectFile}
              filesCount={files.filter(f => !f.is_directory).length}
            />
            <FileContentViewer
              selectedFile={selectedFile}
              fileContent={fileContent}
              loadingContent={loadingContent}
            />
          </div>
        )}
      </div>
    </div>
  );
}
