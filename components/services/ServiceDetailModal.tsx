import { Service } from '@/types/service';
import { X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ServiceDetailModalProps {
  show: boolean;
  service: Service | null;
  onClose: () => void;
  onOpenService: (url: string) => void;
}

export default function ServiceDetailModal({
  show,
  service,
  onClose,
  onOpenService,
}: ServiceDetailModalProps) {
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const togglePasswordVisibility = (field: string) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!show || !service) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">服务详情</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                服务名称
              </label>
              <p className="text-base text-gray-900">{service.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                服务地址
              </label>
              <p className="text-base text-gray-900 break-all">{service.url}</p>
            </div>

            {service.username && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  登录用户名
                </label>
                <p className="text-base text-gray-900">{service.username}</p>
              </div>
            )}

            {service.password && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  登录密码
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-base text-gray-900 flex-1">
                    {showPassword[`detail-${service.id}`] ? service.password : '••••••••'}
                  </p>
                  <button
                    onClick={() => togglePasswordVisibility(`detail-${service.id}`)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword[`detail-${service.id}`] ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {service.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  服务介绍
                </label>
                <p className="text-base text-gray-900">{service.description}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={() => onOpenService(service.url)}
                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                打开服务
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
