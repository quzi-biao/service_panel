'use client';

import { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  FolderPlus, 
  ArrowLeft,
  RefreshCw,
  X
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifyTime: number;
  permissions: number;
}

interface SFTPFileBrowserProps {
  socket: any;
  onClose: () => void;
}

export default function SFTPFileBrowser({ socket, onClose }: SFTPFileBrowserProps) {
  const [currentPath, setCurrentPath] = useState('/root');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [downloadingFile, setDownloadingFile] = useState<{
    fileName: string;
    progress: number;
    speed: number;
    downloadedBytes: number;
    totalBytes: number;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    console.log('Setting up SFTP event listeners');

    socket.on('sftp-dir-list', (data: { path: string; files: FileItem[] }) => {
      console.log('Received sftp-dir-list:', data);
      setFiles(data.files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      }));
      setLoading(false);
    });

    socket.on('sftp-error', (data: { message: string }) => {
      console.error('Received sftp-error:', data);
      setError('SFTP 错误: ' + data.message);
      setLoading(false);
    });

    socket.on('sftp-upload-success', (data: { fileName: string }) => {
      console.log('Upload success:', data.fileName);
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.fileName);
        return newMap;
      });
      // 延迟刷新目录，避免与上传操作冲突
      setTimeout(() => {
        loadDirectory(currentPath);
      }, 500);
    });

    socket.on('sftp-upload-error', (data: { message: string; fileName: string }) => {
      console.error('Upload error:', data);
      setError(`上传失败 ${data.fileName}: ${data.message}`);
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.fileName);
        return newMap;
      });
    });

    socket.on('sftp-upload-progress', (data: { fileName: string; progress: number }) => {
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.set(data.fileName, data.progress);
        return newMap;
      });
    });

    socket.on('sftp-download-start', (data: { fileName: string; fileSize: number }) => {
      console.log('Download started:', data);
      setDownloadingFile({
        fileName: data.fileName,
        progress: 0,
        speed: 0,
        downloadedBytes: 0,
        totalBytes: data.fileSize,
      });
    });

    socket.on('sftp-download-progress', (data: { 
      fileName: string; 
      progress: number; 
      downloadedBytes: number;
      totalBytes: number;
      speed: number;
    }) => {
      console.log('Download progress:', data);
      setDownloadingFile({
        fileName: data.fileName,
        progress: data.progress,
        speed: data.speed,
        downloadedBytes: data.downloadedBytes,
        totalBytes: data.totalBytes,
      });
    });

    socket.on('sftp-download-success', (data: { fileName: string; fileData: string }) => {
      console.log('Download success:', data.fileName);
      try {
        // 将 base64 转换为二进制数据
        const binaryString = atob(data.fileData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadingFile(null);
      } catch (error) {
        console.error('Download error:', error);
        setError('下载文件失败');
        setDownloadingFile(null);
      }
    });

    socket.on('sftp-download-error', (data: { message: string }) => {
      console.error('Download error:', data);
      setError('下载失败: ' + data.message);
      setDownloadingFile(null);
    });

    socket.on('sftp-delete-success', () => {
      loadDirectory(currentPath);
    });

    socket.on('sftp-create-dir-success', () => {
      setShowNewFolderDialog(false);
      setNewFolderName('');
      loadDirectory(currentPath);
    });

    return () => {
      socket.off('sftp-dir-list');
      socket.off('sftp-error');
      socket.off('sftp-upload-success');
      socket.off('sftp-upload-error');
      socket.off('sftp-upload-progress');
      socket.off('sftp-download-start');
      socket.off('sftp-download-progress');
      socket.off('sftp-download-success');
      socket.off('sftp-download-error');
      socket.off('sftp-delete-success');
      socket.off('sftp-create-dir-success');
    };
  }, [socket]);

  useEffect(() => {
    console.log('SFTPFileBrowser mounted, socket:', socket);
    if (socket) {
      console.log('Socket exists, loading directory:', currentPath);
      loadDirectory(currentPath);
    } else {
      console.error('Socket is null or undefined');
      setLoading(false);
      setError('SSH 连接未建立，请先连接到服务器');
    }
  }, []);

  const loadDirectory = (path: string) => {
    if (!socket) {
      setError('SSH 连接未建立');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    console.log('Emitting sftp-list-dir for path:', path);
    socket.emit('sftp-list-dir', { path });
    
    // 添加超时检测
    setTimeout(() => {
      if (loading) {
        console.error('SFTP request timeout after 10 seconds');
        setError('请求超时，请检查服务器连接');
        setLoading(false);
      }
    }, 10000);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      const newPath = currentPath.endsWith('/') 
        ? currentPath + file.name 
        : currentPath + '/' + file.name;
      setCurrentPath(newPath);
      loadDirectory(newPath);
    } else {
      setSelectedFile(file.name);
    }
  };

  const handleGoBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
    loadDirectory(parentPath);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // 检查文件大小（限制为100MB）
      if (file.size > 100 * 1024 * 1024) {
        setError(`文件 ${file.name} 太大（超过100MB），请使用其他方式传输`);
        return;
      }

      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.set(file.name, 0);
          return newMap;
        });
      };
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 50); // 读取占50%
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(file.name, progress);
            return newMap;
          });
        }
      };
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.set(file.name, 50); // 开始上传，设置为50%
          return newMap;
        });
        socket?.emit('sftp-upload-file', {
          remotePath: currentPath,
          fileData: base64Data,
          fileName: file.name,
        });
      };
      reader.onerror = () => {
        setError(`读取文件 ${file.name} 失败`);
        setUploadingFiles(prev => {
          const newMap = new Map(prev);
          newMap.delete(file.name);
          return newMap;
        });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleDownload = () => {
    if (!selectedFile) return;
    const fullPath = currentPath.endsWith('/') 
      ? currentPath + selectedFile 
      : currentPath + '/' + selectedFile;
    console.log('Downloading file:', fullPath);
    socket?.emit('sftp-download-file', { remotePath: fullPath });
  };

  const handleDelete = () => {
    if (!selectedFile) return;
    if (!confirm(`确定要删除 ${selectedFile} 吗？`)) return;

    const file = files.find(f => f.name === selectedFile);
    const fullPath = currentPath.endsWith('/') 
      ? currentPath + selectedFile 
      : currentPath + '/' + selectedFile;
    
    socket?.emit('sftp-delete-file', { 
      remotePath: fullPath,
      type: file?.type 
    });
    setSelectedFile(null);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const fullPath = currentPath.endsWith('/') 
      ? currentPath + newFolderName 
      : currentPath + '/' + newFolderName;
    socket?.emit('sftp-create-dir', { remotePath: fullPath });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return Math.round(bytesPerSecond / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getDownloadPath = () => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      return '~/Downloads';
    } else if (platform.includes('win')) {
      return 'C:\\Users\\[用户名]\\Downloads';
    } else {
      return '~/Downloads';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-lg font-semibold text-gray-800">文件传输</h2>
        <div className="flex items-center gap-2 flex-1 mx-4">
          <button
            onClick={handleGoBack}
            disabled={currentPath === '/'}
            className="p-2 hover:bg-white/80 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
            title="返回上级"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadDirectory(currentPath)}
            className="p-2 hover:bg-white/80 rounded-lg text-gray-700 transition-colors"
            title="刷新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 font-mono">
            {currentPath}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/80 rounded-lg text-gray-700 transition-colors"
          title="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Upload Progress Banner */}
      {uploadingFiles.size > 0 && (
        <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-200">
          <div className="space-y-2">
            {Array.from(uploadingFiles.entries()).map(([fileName, progress]) => (
              <div key={fileName}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600 animate-bounce" />
                    <span className="text-sm font-medium text-indigo-800">
                      正在上传: {fileName}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer shadow-sm hover:shadow transition-all">
          <Upload className="w-4 h-4" />
          上传文件
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </label>
        <button
          onClick={handleDownload}
          disabled={!selectedFile || files.find(f => f.name === selectedFile)?.type === 'directory'}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all"
        >
          <Download className="w-4 h-4" />
          下载
        </button>
        <button
          onClick={() => setShowNewFolderDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          新建文件夹
        </button>
        <button
          onClick={handleDelete}
          disabled={!selectedFile}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all"
        >
          <Trash2 className="w-4 h-4" />
          删除
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="text-red-600 font-medium mb-2">错误</div>
            <div className="text-gray-700 text-center">{error}</div>
            <button
              onClick={() => {
                setError(null);
                loadDirectory(currentPath);
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              重试
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-700 font-medium">加载中...</div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">名称</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">大小</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">修改时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {files.map((file) => (
                <tr
                  key={file.name}
                  onClick={() => handleFileClick(file)}
                  className={`cursor-pointer hover:bg-indigo-50 transition-colors ${
                    selectedFile === file.name ? 'bg-indigo-100' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {file.type === 'directory' ? (
                          <Folder className="w-5 h-5 text-blue-600" />
                        ) : (
                          <File className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-gray-800">{file.name}</span>
                        {uploadingFiles.has(file.name) && (
                          <span className="text-xs text-indigo-600 font-medium">
                            上传中 {uploadingFiles.get(file.name)}%
                          </span>
                        )}
                        {downloadingFile?.fileName === file.name && (
                          <span className="text-xs text-green-600 font-medium">
                            下载中 {downloadingFile.progress}% - {formatSpeed(downloadingFile.speed)}
                          </span>
                        )}
                      </div>
                      {uploadingFiles.has(file.name) && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 ml-7">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadingFiles.get(file.name)}%` }}
                          />
                        </div>
                      )}
                      {downloadingFile?.fileName === file.name && (
                        <div className="ml-7 space-y-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${downloadingFile.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatSize(downloadingFile.downloadedBytes)} / {formatSize(downloadingFile.totalBytes)} 
                            <span className="mx-2">•</span>
                            保存到: {getDownloadPath()}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {file.type === 'file' ? formatSize(file.size) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatDate(file.modifyTime)}
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-600 font-medium">
                    此目录为空
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">新建文件夹</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="文件夹名称"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
