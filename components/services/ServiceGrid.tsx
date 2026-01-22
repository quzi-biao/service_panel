import { Service } from '@/types/service';
import { Pin } from 'lucide-react';

interface ServiceGridProps {
  services: Service[];
  filteredServices: Service[];
  searchQuery: string;
  onServiceClick: (url: string) => void;
  onContextMenu: (e: React.MouseEvent, service: Service) => void;
}

export default function ServiceGrid({
  services,
  filteredServices,
  searchQuery,
  onServiceClick,
  onContextMenu,
}: ServiceGridProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <p className="text-gray-500 text-lg">暂无服务，点击"添加服务"开始添加</p>
      </div>
    );
  }

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <p className="text-gray-500 text-lg">没有找到匹配的服务</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredServices.map((service) => (
        <div
          key={service.id}
          onClick={() => onServiceClick(service.url)}
          onContextMenu={(e) => onContextMenu(e, service)}
          className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer flex flex-col border hover:border-indigo-200 transform hover:-translate-y-1 relative ${
            service.is_pinned ? 'border-yellow-300/50' : 'border-white/50'
          }`}
        >
          {service.is_pinned && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Pin className="w-3 h-3 fill-current" />
              置顶
            </div>
          )}
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all pr-16">
            {service.name}
          </h3>
          <p className="text-sm text-gray-500 truncate group-hover:text-indigo-600 transition-colors" title={service.url}>
            {service.url}
          </p>
        </div>
      ))}
    </div>
  );
}
