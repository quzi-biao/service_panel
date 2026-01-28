'use client';

import { Folder, File } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifyTime: number;
  permissions: number;
}

interface FileListTableProps {
  files: FileItem[];
  selectedFile: string | null;
  uploadingFiles: Map<string, number>;
  downloadingFile: {
    fileName: string;
    progress: number;
    speed: number;
    downloadedBytes: number;
    totalBytes: number;
  } | null;
  onFileClick: (file: FileItem) => void;
  formatSize: (bytes: number) => string;
  formatSpeed: (bytesPerSecond: number) => string;
  formatDate: (timestamp: number) => string;
  getDownloadPath: () => string;
}

export default function FileListTable({
  files,
  selectedFile,
  uploadingFiles,
  downloadingFile,
  onFileClick,
  formatSize,
  formatSpeed,
  formatDate,
  getDownloadPath,
}: FileListTableProps) {
  return (
    <table className="w-full">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            名称
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            大小
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
            修改时间
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {files.map((file) => (
          <tr
            key={file.name}
            onClick={() => onFileClick(file)}
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
                    <span className={`text-xs font-medium ${uploadingFiles.get(file.name) === 100 ? 'text-green-600' : 'text-indigo-600'}`}>
                      {uploadingFiles.get(file.name) === 100 ? '上传完成' : '上传中'} {uploadingFiles.get(file.name)}%
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
                      className={`h-1.5 rounded-full transition-all duration-300 ${uploadingFiles.get(file.name) === 100 ? 'bg-green-600' : 'bg-indigo-600'}`}
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
  );
}
