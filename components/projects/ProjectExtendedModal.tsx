import { Project, ProjectExtendedInput } from '@/types/project';
import { X } from 'lucide-react';

interface ProjectExtendedModalProps {
  show: boolean;
  editingProject: Project | null;
  extendedData: ProjectExtendedInput;
  middlewareInput: { middleware_name: string; middleware_config: string };
  resourceInput: { resource_name: string; resource_description: string };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onExtendedDataChange: (data: ProjectExtendedInput) => void;
  onMiddlewareInputChange: (data: { middleware_name: string; middleware_config: string }) => void;
  onResourceInputChange: (data: { resource_name: string; resource_description: string }) => void;
  onAddMiddleware: () => void;
  onRemoveMiddleware: (index: number) => void;
  onAddResource: () => void;
  onRemoveResource: (index: number) => void;
}

export default function ProjectExtendedModal({
  show,
  editingProject,
  extendedData,
  middlewareInput,
  resourceInput,
  onClose,
  onSubmit,
  onExtendedDataChange,
  onMiddlewareInputChange,
  onResourceInputChange,
  onAddMiddleware,
  onRemoveMiddleware,
  onAddResource,
  onRemoveResource,
}: ProjectExtendedModalProps) {
  if (!show || !editingProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              编辑扩展信息 - {editingProject.name}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                扩展信息
              </label>
              <textarea
                value={extendedData.extended_info}
                onChange={(e) => onExtendedDataChange({ ...extendedData, extended_info: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                placeholder="项目的其他扩展信息"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目依赖的中间件
              </label>
              <div className="space-y-2">
                {extendedData.middleware && extendedData.middleware.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {extendedData.middleware.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.middleware_name}</p>
                            {item.middleware_config && (
                              <p className="text-sm text-gray-600 mt-1">{item.middleware_config}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveMiddleware(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={middlewareInput.middleware_name}
                    onChange={(e) => onMiddlewareInputChange({ ...middlewareInput, middleware_name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="中间件名称（如：Redis）"
                  />
                  <input
                    type="text"
                    value={middlewareInput.middleware_config}
                    onChange={(e) => onMiddlewareInputChange({ ...middlewareInput, middleware_config: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="配置信息"
                  />
                </div>
                <button
                  type="button"
                  onClick={onAddMiddleware}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加中间件
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目依赖的外部资源
              </label>
              <div className="space-y-2">
                {extendedData.resources && extendedData.resources.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {extendedData.resources.map((item, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.resource_name}</p>
                            {item.resource_description && (
                              <p className="text-sm text-gray-600 mt-1">{item.resource_description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveResource(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={resourceInput.resource_name}
                    onChange={(e) => onResourceInputChange({ ...resourceInput, resource_name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="资源名称（如：OSS存储）"
                  />
                  <input
                    type="text"
                    value={resourceInput.resource_description}
                    onChange={(e) => onResourceInputChange({ ...resourceInput, resource_description: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="资源描述"
                  />
                </div>
                <button
                  type="button"
                  onClick={onAddResource}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加资源
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
