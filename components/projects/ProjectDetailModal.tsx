import { Project } from '@/types/project';
import { X, ExternalLink } from 'lucide-react';

interface ProjectDetailModalProps {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  onOpenProject: (url: string | null) => void;
}

export default function ProjectDetailModal({
  show,
  project,
  onClose,
  onOpenProject,
}: ProjectDetailModalProps) {
  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">项目详情</h2>
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
                项目名称
              </label>
              <p className="text-base text-gray-900">{project.name}</p>
            </div>

            {project.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  项目描述
                </label>
                <p className="text-base text-gray-900">{project.description}</p>
              </div>
            )}

            {project.project_url && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  项目链接
                </label>
                <p className="text-base text-gray-900 break-all">{project.project_url}</p>
              </div>
            )}

            {project.dev_device_name && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  开发设备
                </label>
                <p className="text-base text-gray-900">{project.dev_device_name}</p>
              </div>
            )}

            {project.dev_device_path && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  文件路径
                </label>
                <p className="text-base text-gray-900 font-mono text-sm">{project.dev_device_path}</p>
              </div>
            )}

            {project.deploy_server && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  部署服务器
                </label>
                <p className="text-base text-gray-900">{project.deploy_server}</p>
              </div>
            )}

            {project.service_urls && JSON.parse(project.service_urls as any).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  关联的服务地址
                </label>
                <div className="space-y-1">
                  {JSON.parse(project.service_urls as any).map((url: string, index: number) => (
                    <p key={index} className="text-base text-gray-900 break-all">{url}</p>
                  ))}
                </div>
              </div>
            )}

            {project.project_url && (
              <div className="pt-4">
                <button
                  onClick={() => onOpenProject(project.project_url)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  打开项目
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
