import { Project, ProjectBasicInput } from '@/types/project';
import { X } from 'lucide-react';

interface ProjectModalProps {
  show: boolean;
  editingProject: Project | null;
  formData: ProjectBasicInput;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: ProjectBasicInput) => void;
}

export default function ProjectModal({
  show,
  editingProject,
  formData,
  onClose,
  onSubmit,
  onChange,
}: ProjectModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingProject ? '编辑项目' : '新建项目'}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="例如：我的项目"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目类型 <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.project_type}
                onChange={(e) => onChange({ ...formData, project_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              >
                <option value="">请选择项目类型</option>
                <option value="web">Web应用</option>
                <option value="mobile">移动应用</option>
                <option value="backend">后端服务</option>
                <option value="desktop">桌面应用</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目地址
              </label>
              <input
                type="url"
                value={formData.project_url || ''}
                onChange={(e) => onChange({ ...formData, project_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目描述
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => onChange({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900"
                placeholder="简要描述这个项目的用途"
              />
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
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
              >
                {editingProject ? '保存' : '创建'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
