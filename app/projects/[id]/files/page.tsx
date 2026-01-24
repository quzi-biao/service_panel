'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, RefreshCw, Menu, Palette } from 'lucide-react';
import FileTreeNavigation from '@/components/projects/detail/FileTreeNavigation';
import FileContentViewer from '@/components/projects/detail/FileContentViewer';
import MobileFileSidebar from '@/components/projects/detail/MobileFileSidebar';
import Header from '@/components/shared/Header';

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
  const [syncing, setSyncing] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openTabs, setOpenTabs] = useState<ProjectFile[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('VS Light');
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const themes = {
    'VS Code Dark': 'vscDarkPlus',
    'One Dark': 'oneDark',
    'Atom Dark': 'atomDark',
    'Tomorrow': 'tomorrow',
    'Okaidia': 'okaidia',
    'Solarized Light': 'solarizedlight',
    'VS Light': 'vs',
    'Material Light': 'materialLight',
    'Material Dark': 'materialDark',
    'Dracula': 'dracula',
  };

  useEffect(() => {
    fetchProject();
    fetchFiles();
    loadOpenTabs();
  }, [projectId]);

  const loadOpenTabs = () => {
    try {
      const stored = localStorage.getItem(`openTabs_${projectId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOpenTabs(parsed.tabs || []);
        setActiveTabIndex(parsed.activeIndex || 0);
        // Load content for the active tab
        if (parsed.tabs && parsed.tabs.length > 0) {
          const activeFile = parsed.tabs[parsed.activeIndex || 0];
          if (activeFile) {
            setSelectedFile(activeFile);
            loadFileContent(activeFile);
          }
        }
      }
    } catch (error) {
      console.error('Error loading open tabs:', error);
    }
  };

  const saveOpenTabs = (tabs: ProjectFile[], activeIndex: number) => {
    try {
      localStorage.setItem(`openTabs_${projectId}`, JSON.stringify({ tabs, activeIndex }));
    } catch (error) {
      console.error('Error saving open tabs:', error);
    }
  };

  const addOrSwitchToTab = (file: ProjectFile) => {
    const existingIndex = openTabs.findIndex(f => f.id === file.id);
    if (existingIndex >= 0) {
      // Tab already exists, just switch to it
      setActiveTabIndex(existingIndex);
      setSelectedFile(file);
      saveOpenTabs(openTabs, existingIndex);
    } else {
      // Add new tab
      const newTabs = [...openTabs, file];
      const newIndex = newTabs.length - 1;
      setOpenTabs(newTabs);
      setActiveTabIndex(newIndex);
      setSelectedFile(file);
      saveOpenTabs(newTabs, newIndex);
    }
  };

  const closeTab = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newTabs = openTabs.filter((_, i) => i !== index);
    let newActiveIndex = activeTabIndex;
    
    if (index === activeTabIndex) {
      // Closing active tab
      if (newTabs.length === 0) {
        setSelectedFile(null);
        setFileContent('');
        newActiveIndex = 0;
      } else if (index >= newTabs.length) {
        newActiveIndex = newTabs.length - 1;
        setSelectedFile(newTabs[newActiveIndex]);
        loadFileContent(newTabs[newActiveIndex]);
      } else {
        setSelectedFile(newTabs[newActiveIndex]);
        loadFileContent(newTabs[newActiveIndex]);
      }
    } else if (index < activeTabIndex) {
      newActiveIndex = activeTabIndex - 1;
    }
    
    setOpenTabs(newTabs);
    setActiveTabIndex(newActiveIndex);
    saveOpenTabs(newTabs, newActiveIndex);
  };

  const switchTab = (index: number) => {
    setActiveTabIndex(index);
    const file = openTabs[index];
    setSelectedFile(file);
    loadFileContent(file);
    saveOpenTabs(openTabs, index);
  };

  const loadFileContent = async (file: ProjectFile) => {
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
      
      // 创建文件选择器
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.webkitdirectory = true; // 允许选择文件夹
      
      input.onchange = async (e: any) => {
        const selectedFiles = Array.from(e.target.files || []) as File[];
        
        if (selectedFiles.length === 0) {
          setScanning(false);
          return;
        }

        try {
          // 过滤掉需要排除的文件
          const filteredFiles = selectedFiles.filter(file => {
            const filePath = file.webkitRelativePath || file.name;
            return !shouldExclude(filePath);
          });

          const excludedCount = selectedFiles.length - filteredFiles.length;
          
          console.log('=== 文件扫描过滤信息 ===');
          console.log(`选中文件总数: ${selectedFiles.length}`);
          console.log(`被排除文件数: ${excludedCount}`);
          console.log(`将要扫描文件数: ${filteredFiles.length}`);
          console.log('====================');
          
          if (filteredFiles.length === 0) {
            alert(`所有文件都被排除了\n选中: ${selectedFiles.length} 个文件\n排除: ${excludedCount} 个文件`);
            setScanning(false);
            return;
          }

          // 获取根目录名称（第一个文件的第一级路径）
          const rootDirName = filteredFiles.length > 0 
            ? (filteredFiles[0].webkitRelativePath || filteredFiles[0].name).split('/')[0]
            : '';

          // 构建文件树结构，移除根目录前缀
          const fileInfos = filteredFiles.map(file => {
            const fullPath = file.webkitRelativePath || file.name;
            const pathParts = fullPath.split('/');
            
            // 移除根目录，从第二级开始
            const relativeParts = pathParts.slice(1);
            if (relativeParts.length === 0) {
              return null; // 跳过根目录本身
            }
            
            const filePath = relativeParts.join('/');
            const fileName = relativeParts[relativeParts.length - 1];
            const parentPath = relativeParts.length > 1 ? relativeParts.slice(0, -1).join('/') : '';
            const fileType = fileName.includes('.') ? fileName.split('.').pop() || 'file' : 'file';
            
            return {
              filePath,
              fileName,
              fileSize: file.size,
              fileType,
              isDirectory: false,
              parentPath: parentPath || null,
            };
          }).filter(f => f !== null);

          // 添加目录节点（不包括根目录）
          const directories = new Set<string>();
          filteredFiles.forEach(file => {
            const fullPath = file.webkitRelativePath || file.name;
            const pathParts = fullPath.split('/');
            
            // 从第二级开始创建目录节点（跳过根目录）
            for (let i = 2; i < pathParts.length; i++) {
              const relativeParts = pathParts.slice(1, i);
              const dirPath = relativeParts.join('/');
              
              if (!directories.has(dirPath)) {
                directories.add(dirPath);
                const dirName = relativeParts[relativeParts.length - 1];
                const parentPath = relativeParts.length > 1 ? relativeParts.slice(0, -1).join('/') : '';
                
                fileInfos.push({
                  filePath: dirPath,
                  fileName: dirName,
                  fileSize: 0,
                  fileType: 'directory',
                  isDirectory: true,
                  parentPath: parentPath || null,
                });
              }
            }
          });

          console.log(`根目录 "${rootDirName}" 已被过滤，只记录其子文件和子目录`);

          // 上传文件信息到服务器
          const response = await fetch(`/api/projects/${projectId}/files/scan`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: fileInfos }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            alert(`扫描完成！\n扫描文件数: ${result.filesCount}`);
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
      
      input.click();
    } catch (error) {
      console.error('Error scanning files:', error);
      alert('扫描失败');
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

    addOrSwitchToTab(file);
    loadFileContent(file);
  };

  const deleteFile = async (file: ProjectFile) => {
    const confirmMessage = file.is_directory 
      ? `确定要删除目录 "${file.file_name}" 及其所有子文件吗？`
      : `确定要删除文件 "${file.file_name}" 吗？`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}/delete`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        alert(result.message);
        await fetchFiles();
        // 如果删除的是当前选中的文件，清空选中状态
        if (selectedFile?.id === file.id) {
          setSelectedFile(null);
          setFileContent('');
        }
      } else {
        alert('删除失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('删除失败');
    }
  };

  const syncFile = async (file: ProjectFile) => {
    try {
      setSyncing(true);
      const response = await fetch(`/api/projects/${projectId}/files/${file.id}/sync`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        alert(result.updated ? '文件内容已更新到数据库' : '文件内容已同步到数据库');
        await fetchFiles();
      } else {
        alert('同步失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('Error syncing file:', error);
      alert('同步失败');
    } finally {
      setSyncing(false);
    }
  };

  // 需要排除的目录和文件模式
  const EXCLUDED_PATTERNS = [
    'node_modules',
    'dist',
    'build',
    'out',
    '.next',
    'target',
    'bin',
    '.gradle',
    '.mvn',
    'vendor',
    '__pycache__',
    '.pytest_cache',
    'venv',
    'env',
    '.venv',
    '.git',
    '.svn',
    '.hg',
    '.idea',
    '.vscode',
    '.DS_Store',
    'coverage',
    '.nyc_output',
    'logs',
    '*.log',
    '.cache',
    'tmp',
    'temp',
  ];

  // 检查路径是否应该被排除（在目录级别就排除）
  const shouldExclude = (filePath: string): boolean => {
    const normalizedPath = filePath.replace(/\\/g, '/');
    const pathParts = normalizedPath.split('/');
    
    // 检查路径的每个部分是否匹配排除模式
    for (const part of pathParts) {
      for (const pattern of EXCLUDED_PATTERNS) {
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
          if (regex.test(part)) {
            return true;
          }
        } else if (part === pattern) {
          // 精确匹配目录名或文件名
          return true;
        }
      }
    }
    
    return false;
  };

  const syncAllFiles = async () => {
    try {
      setSyncingAll(true);
      
      // 创建文件选择器
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.webkitdirectory = true; // 允许选择文件夹
      
      input.onchange = async (e: any) => {
        const selectedFiles = Array.from(e.target.files || []) as File[];
        
        if (selectedFiles.length === 0) {
          setSyncingAll(false);
          return;
        }

        try {
          // 过滤掉需要排除的文件
          const excludedFiles: string[] = [];
          const filteredFiles = selectedFiles.filter(file => {
            const filePath = file.webkitRelativePath || file.name;
            const excluded = shouldExclude(filePath);
            if (excluded && excludedFiles.length < 10) {
              excludedFiles.push(filePath);
            }
            return !excluded;
          });

          const excludedCount = selectedFiles.length - filteredFiles.length;
          
          console.log('=== 文件同步过滤信息 ===');
          console.log(`选中文件总数: ${selectedFiles.length}`);
          console.log(`被排除文件数: ${excludedCount}`);
          console.log(`将要上传文件数: ${filteredFiles.length}`);
          if (excludedFiles.length > 0) {
            console.log('被排除的文件示例（前10个）:');
            excludedFiles.forEach(f => console.log(`  - ${f}`));
          }
          console.log('====================');
          
          if (filteredFiles.length === 0) {
            alert(`所有文件都被排除了\n选中: ${selectedFiles.length} 个文件\n排除: ${excludedCount} 个文件`);
            setSyncingAll(false);
            return;
          }

          // 读取所有文件内容
          const fileContents = await Promise.all(
            filteredFiles.map(async (file) => {
              const content = await file.text();
              const filePath = file.webkitRelativePath || file.name;
              
              // 在数据库中查找对应的文件记录
              const matchingFile = files.find(f => 
                f.file_path === filePath || 
                f.file_path.endsWith('/' + filePath) ||
                filePath.endsWith(f.file_path)
              );
              
              if (matchingFile) {
                return {
                  fileId: matchingFile.id,
                  content,
                  filePath: matchingFile.file_path
                };
              }
              return null;
            })
          );

          // 过滤掉未匹配的文件
          const validFiles = fileContents.filter(f => f !== null);
          
          if (validFiles.length === 0) {
            alert('没有找到匹配的文件');
            setSyncingAll(false);
            return;
          }

          // 上传文件内容到服务器
          const response = await fetch(`/api/projects/${projectId}/files/upload-content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: validFiles }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            const message = `同步完成！\n总文件数: ${result.totalFiles}\n已同步: ${result.syncedCount}\n更新: ${result.updatedCount}\n新建: ${result.createdCount}`;
            alert(message);
            await fetchFiles();
          } else {
            alert('同步失败: ' + (result.error || '未知错误'));
          }
        } catch (error) {
          console.error('Error uploading files:', error);
          alert('同步失败');
        } finally {
          setSyncingAll(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error syncing files:', error);
      alert('同步失败');
      setSyncingAll(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        leftContent={
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/projects')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← <span className="hidden md:inline">返回</span>
            </button>
            <h1 className="text-lg font-semibold text-white hidden md:block">{project?.name || '项目文件'}</h1>
          </div>
        }
        rightContent={
          <>
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* 主题选择器 */}
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{selectedTheme}</span>
              </button>
              {showThemeSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-auto">
                  {Object.keys(themes).map((themeName) => (
                    <button
                      key={themeName}
                      onClick={() => {
                        setSelectedTheme(themeName);
                        setShowThemeSelector(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        selectedTheme === themeName ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {themeName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* 桌面端扫描和同步按钮 */}
            <button
              onClick={scanFiles}
              disabled={scanning}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
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
            <button
              onClick={syncAllFiles}
              disabled={syncingAll}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {syncingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  同步文件
                </>
              )}
            </button>
          </>
        }
      />
      
      <div className="max-w-full mx-auto px-4 py-6">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
            {/* 桌面端文件树 */}
            <div className="hidden md:block md:col-span-3 h-full">
              <FileTreeNavigation
                tree={tree}
                selectedFile={selectedFile}
                expandedPaths={expandedPaths}
                onSelectFile={selectFile}
                onDeleteFile={deleteFile}
                filesCount={files.filter(f => !f.is_directory).length}
                projectId={projectId}
                onNavigateToGraph={() => router.push(`/projects/${projectId}/file-graph`)}
              />
            </div>
            
            {/* 文件内容查看器带标签页 */}
            <div className="col-span-12 md:col-span-9 h-full flex flex-col">
              {/* 标签页 */}
              {openTabs.length > 0 && (
                <div className="bg-white border-b border-gray-200 flex items-center overflow-x-auto">
                  {openTabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => switchTab(index)}
                      className={`flex items-center gap-2 px-4 py-2 border-r border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0 ${
                        index === activeTabIndex ? 'bg-indigo-50 border-b-2 border-b-indigo-600' : ''
                      }`}
                    >
                      <span className="text-sm text-gray-900 truncate max-w-[150px]">{tab.file_name}</span>
                      <button
                        onClick={(e) => closeTab(index, e)}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </button>
                  ))}
                </div>
              )}
              
              {/* 文件内容 */}
              <div className="flex-1 overflow-hidden">
                <FileContentViewer
                  selectedFile={selectedFile}
                  fileContent={fileContent}
                  loadingContent={loadingContent}
                  theme={selectedTheme as any}
                  className='rounded-t-none border-t-0'
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 移动端侧边栏 */}
      <MobileFileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        tree={tree}
        selectedFile={selectedFile}
        expandedPaths={expandedPaths}
        onSelectFile={selectFile}
        onDeleteFile={deleteFile}
        filesCount={files.filter(f => !f.is_directory).length}
        projectId={projectId}
        onNavigateToGraph={() => router.push(`/projects/${projectId}/file-graph`)}
      />
    </div>
  );
}
