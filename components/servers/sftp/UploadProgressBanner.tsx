'use client';

import { Upload, X } from 'lucide-react';

interface UploadProgressBannerProps {
  uploadingFiles: Map<string, number>;
  onClose: (fileName: string) => void;
}

export default function UploadProgressBanner({ uploadingFiles, onClose }: UploadProgressBannerProps) {
  if (uploadingFiles.size === 0) return null;

  return (
    <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-200">
      <div className="space-y-2">
        {Array.from(uploadingFiles.entries()).map(([fileName, progress]) => (
          <div key={fileName}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {progress < 100 ? (
                  <Upload className="w-4 h-4 text-indigo-600 animate-bounce" />
                ) : (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm font-medium ${progress < 100 ? 'text-indigo-800' : 'text-green-800'}`}>
                  {progress < 100 ? '正在上传' : '上传完成'}: {fileName}
                </span>
                <span className={`text-xs font-medium ${progress < 100 ? 'text-indigo-600' : 'text-green-600'}`}>
                  {progress}%
                </span>
              </div>
              {progress === 100 && (
                <button
                  onClick={() => onClose(fileName)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="关闭"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <div className={`w-full rounded-full h-2 ${progress < 100 ? 'bg-indigo-200' : 'bg-green-200'}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${progress < 100 ? 'bg-indigo-600' : 'bg-green-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
