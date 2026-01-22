import { Service } from '@/types/service';
import { Info, Pin, Edit, Trash2 } from 'lucide-react';

interface ServiceContextMenuProps {
  contextMenu: { x: number; y: number; item: Service } | null;
  onViewDetail: (service: Service) => void;
  onTogglePin: (id: number) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export default function ServiceContextMenu({
  contextMenu,
  onViewDetail,
  onTogglePin,
  onEdit,
  onDelete,
  onClose,
}: ServiceContextMenuProps) {
  if (!contextMenu) return null;

  return (
    <div
      className="fixed bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-100 py-2 z-50 min-w-[180px]"
      style={{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onViewDetail(contextMenu.item);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
      >
        <Info className="w-4 h-4" />
        查看详情
      </button>
      <button
        onClick={() => {
          onTogglePin(contextMenu.item.id);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
      >
        <Pin className={`w-4 h-4 ${contextMenu.item.is_pinned ? 'fill-current' : ''}`} />
        {contextMenu.item.is_pinned ? '取消置顶' : '置顶'}
      </button>
      <button
        onClick={() => {
          onEdit(contextMenu.item);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
      >
        <Edit className="w-4 h-4" />
        编辑
      </button>
      <div className="border-t border-gray-200 my-1.5 mx-2"></div>
      <button
        onClick={() => {
          onDelete(contextMenu.item.id);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
      >
        <Trash2 className="w-4 h-4" />
        删除
      </button>
    </div>
  );
}
