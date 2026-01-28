'use client';

interface NewFolderDialogProps {
  show: boolean;
  folderName: string;
  onFolderNameChange: (name: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export default function NewFolderDialog({
  show,
  folderName,
  onFolderNameChange,
  onCreate,
  onCancel,
}: NewFolderDialogProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">新建文件夹</h3>
        <input
          type="text"
          value={folderName}
          onChange={(e) => onFolderNameChange(e.target.value)}
          placeholder="文件夹名称"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          onKeyPress={(e) => e.key === 'Enter' && onCreate()}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
