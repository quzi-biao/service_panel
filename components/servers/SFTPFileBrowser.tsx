'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  FolderPlus, 
  ArrowLeft,
  RefreshCw,
  X
} from 'lucide-react';
import UploadProgressBanner from './sftp/UploadProgressBanner';
import SuccessMessageBanner from './sftp/SuccessMessageBanner';
import FileListTable from './sftp/FileListTable';
import NewFolderDialog from './sftp/NewFolderDialog';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('sftp-dir-list', (data: { path: string; files: FileItem[] }) => {
      setFiles(data.files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      }));
      setLoading(false);
    });

    socket.on('sftp-error', (data: { message: string }) => {
      setError('SFTP 错误: ' + data.message);
      setLoading(false);
    });

    socket.on('sftp-upload-success', (data: { fileName: string }) => {
      setUploadingFiles(prev => {
        const newMap = new Map(prev);
        newMap.delete(data.fileName);
        return newMap;
      });
      setSuccessMessage(`文件 ${data.fileName} 上传成功！`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      setTimeout(() => {
        loadDirectory(currentPath);
      }, 500);
    });

    socket.on('sftp-upload-error', (data: { message: string; fileName: string }) => {
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
      setDownloadingFile({
        fileName: data.fileName,
        progress: data.progress,
        speed: data.speed,
        downloadedBytes: data.downloadedBytes,
        totalBytes: data.totalBytes,
      });
    });

    socket.on('sftp-download-success', (data: { fileName: string; fileData: string }) => {
      try {
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
        setSuccessMessage(`文件 ${data.fileName} 下载成功！`);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (error) {
        setError('下载文件失败');
        setDownloadingFile(null);
      }
    });

    socket.on('sftp-download-error', (data: { message: string }) => {
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
    if (socket) {
      loadDirectory(currentPath);
    } else {
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
    socket.emit('sftp-list-dir', { path });
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
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
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
      <UploadProgressBanner
        uploadingFiles={uploadingFiles}
        onClose={(fileName) => {
          setUploadingFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(fileName);
            return newMap;
          });
        }}
      />

      {/* Success Message Banner */}
      <SuccessMessageBanner message={successMessage} />

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
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <FileListTable
            files={files}
            selectedFile={selectedFile}
            uploadingFiles={uploadingFiles}
            downloadingFile={downloadingFile}
            onFileClick={handleFileClick}
            formatSize={formatSize}
            formatSpeed={formatSpeed}
            formatDate={formatDate}
            getDownloadPath={getDownloadPath}
          />
        )}
      </div>

      {/* New Folder Dialog */}
      <NewFolderDialog
        show={showNewFolderDialog}
        folderName={newFolderName}
        onFolderNameChange={setNewFolderName}
        onCreate={handleCreateFolder}
        onCancel={() => {
          setShowNewFolderDialog(false);
          setNewFolderName('');
        }}
      />
    </div>
  );
}
