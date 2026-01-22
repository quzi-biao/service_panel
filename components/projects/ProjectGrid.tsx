import { Project } from '@/types/project';
import { Pin } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  filteredProjects: Project[];
  searchQuery: string;
  onProjectClick: (url: string | null) => void;
  onContextMenu: (e: React.MouseEvent, project: Project) => void;
}

export default function ProjectGrid({
  projects,
  filteredProjects,
  searchQuery,
  onProjectClick,
  onContextMenu,
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <p className="text-gray-500 text-lg">暂无项目，点击"添加项目"开始添加</p>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <p className="text-gray-500 text-lg">没有找到匹配的项目</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredProjects.map((project) => (
        <div
          key={project.id}
          onClick={() => project.project_url && onProjectClick(project.project_url)}
          onContextMenu={(e) => onContextMenu(e, project)}
          className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer flex flex-col border hover:border-indigo-200 transform hover:-translate-y-1 relative ${
            project.is_pinned ? 'border-yellow-300/50' : 'border-white/50'
          }`}
        >
          {project.is_pinned && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Pin className="w-3 h-3 fill-current" />
              置顶
            </div>
          )}
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all pr-16">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
          )}
          {project.project_url && (
            <p className="text-sm text-gray-400 truncate group-hover:text-indigo-600 transition-colors" title={project.project_url}>
              {project.project_url}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
