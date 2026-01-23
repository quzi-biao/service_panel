'use client';

import { File, Loader2 } from 'lucide-react';

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

interface FileContentViewerProps {
  selectedFile: ProjectFile | null;
  fileContent: string;
  loadingContent: boolean;
}

export default function FileContentViewer({
  selectedFile,
  fileContent,
  loadingContent,
}: FileContentViewerProps) {
  return (
    <div className="col-span-9 bg-white rounded-lg shadow flex flex-col overflow-hidden">
      {selectedFile ? (
        <>
          {/* 固定的标题栏 */}
          <div className="p-4 border-b flex-shrink-0">
            <h2 className="font-semibold text-gray-900">{selectedFile.file_name}</h2>
            <p className="text-sm text-gray-500 mt-1">{selectedFile.file_path}</p>
            {selectedFile.file_md5 && (
              <p className="text-xs text-gray-400 mt-1 font-mono">
                MD5: {selectedFile.file_md5}
              </p>
            )}
          </div>
          {/* 可滚动的内容区域 */}
          <div className="flex-1 overflow-auto p-4">
            {loadingContent ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap break-words bg-gray-50 p-4 rounded">
                {fileContent}
              </pre>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>选择一个文件查看内容</p>
          </div>
        </div>
      )}
    </div>
  );
}
