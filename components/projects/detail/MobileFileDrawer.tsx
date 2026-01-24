'use client';

import { X } from 'lucide-react';
import FileContentViewer from './FileContentViewer';

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

interface MobileFileDrawerProps {
  isOpen: boolean;
  selectedFile: ProjectFile | null;
  fileContent: string;
  loadingContent: boolean;
  onClose: () => void;
}

export default function MobileFileDrawer({
  isOpen,
  selectedFile,
  fileContent,
  loadingContent,
  onClose,
}: MobileFileDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* 底部弹窗 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 animate-slide-up" style={{ height: '70vh' }}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">{selectedFile?.file_name}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(70vh-64px)] overflow-auto">
          <FileContentViewer
            selectedFile={selectedFile}
            fileContent={fileContent}
            loadingContent={loadingContent}
            showCloseButton={false}
            className="shadow-none rounded-none"
          />
        </div>
      </div>
    </>
  );
}
