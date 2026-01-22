import { Project, ProjectBasicInput } from '@/types/project';
import { X } from 'lucide-react';

interface ProjectModalProps {
  show: boolean;
  editingProject: Project | null;
  formData: ProjectBasicInput;
  serviceUrlInput: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: ProjectBasicInput) => void;
  onServiceUrlInputChange: (value: string) => void;
  onAddServiceUrl: () => void;
  onRemoveServiceUrl: (index: number) => void;
}

export default function ProjectModal({
  show,
  editingProject,
  formData,
  serviceUrlInput,
  onClose,
  onSubmit,
  onChange,
  onServiceUrlInputChange,
  onAddServiceUrl,
  onRemoveServiceUrl,
}: ProjectModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProject ? '编辑项目' : '添加项目'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => onChange({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="例如：电商平台"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目类型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.project_type}
                onChange={(e) => onChange({ ...formData, project_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="例如：前端项目、后端服务、移动应用等"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                placeholder="简要描述项目的用途"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目链接
              </label>
              <input
                type="url"
                value={formData.project_url}
                onChange={(e) => onChange({ ...formData, project_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="https://github.com/username/project"
              />
            </div>

            {editingProject && (
              <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开发设备名称
                </label>
                <input
                  type="text"
                  value={formData.dev_device_name}
                  onChange={(e) => onChange({ ...formData, dev_device_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="MacBook Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文件路径
                </label>
                <input
                  type="text"
                  value={formData.dev_device_path}
                  onChange={(e) => onChange({ ...formData, dev_device_path: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="/path/to/project"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                部署服务器
              </label>
              <input
                type="text"
                value={formData.deploy_server}
                onChange={(e) => onChange({ ...formData, deploy_server: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="例如：阿里云服务器"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关联的服务地址
              </label>
              <div className="space-y-2">
                {formData.service_urls && formData.service_urls.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {formData.service_urls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={url}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveServiceUrl(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={serviceUrlInput}
                    onChange={(e) => onServiceUrlInputChange(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="https://api.example.com"
                  />
                  <button
                    type="button"
                    onClick={onAddServiceUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
              </>
            )}

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
                {editingProject ? '保存' : '添加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
