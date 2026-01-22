'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ChevronDown, ChevronRight, FolderGit2 } from 'lucide-react';

interface ProjectNavigationProps {
  currentProjectId: string;
  onProjectChange: (projectId: number) => void;
}

interface ProjectsByType {
  [key: string]: Project[];
}

export default function ProjectNavigation({ currentProjectId, onProjectChange }: ProjectNavigationProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
        
        // Auto-expand the type of current project
        const currentProject = data.find((p: Project) => p.id.toString() === currentProjectId);
        if (currentProject) {
          setExpandedTypes(new Set([currentProject.project_type]));
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const projectsByType: ProjectsByType = projects.reduce((acc, project) => {
    const type = project.project_type || '未分类';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(project);
    return acc;
  }, {} as ProjectsByType);

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
  };

  const handleProjectClick = (projectId: number) => {
    onProjectChange(projectId);
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sticky top-8">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <FolderGit2 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">项目导航</h2>
      </div>

      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {Object.entries(projectsByType).sort(([a], [b]) => a.localeCompare(b)).map(([type, typeProjects]) => (
          <div key={type}>
            <button
              onClick={() => toggleType(type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {expandedTypes.has(type) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <span className="flex-1 text-left">{type}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {typeProjects.length}
              </span>
            </button>

            {expandedTypes.has(type) && (
              <div className="ml-6 mt-1 space-y-1">
                {typeProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      project.id.toString() === currentProjectId
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        project.id.toString() === currentProjectId
                          ? 'bg-indigo-600'
                          : 'bg-gray-300'
                      }`} />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">暂无项目</p>
      )}
    </div>
  );
}
