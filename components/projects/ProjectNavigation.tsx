'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { ChevronDown, ChevronRight, FolderGit2, Pin, Search, X } from 'lucide-react';

interface ProjectNavigationProps {
  currentProjectId: string;
  onProjectChange: (projectId: number) => void;
}

interface ProjectsByType {
  [key: string]: Project[];
}

interface ProjectType {
  id: number;
  name: string;
  sort_order: number;
}

export default function ProjectNavigation({ currentProjectId, onProjectChange }: ProjectNavigationProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchProjectTypes();
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
          setExpandedTypes(new Set([currentProject.project_type?.toString() || '']));
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const response = await fetch('/api/project-types');
      if (response.ok) {
        const data = await response.json();
        setProjectTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch project types:', error);
    }
  };

  const getTypeName = (typeId: string | number | null): string => {
    if (!typeId) return '未分类';
    const type = projectTypes.find(t => t.id.toString() === typeId.toString());
    return type ? type.name : '未分类';
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return project.name.toLowerCase().includes(query) ||
           project.description?.toLowerCase().includes(query) ||
           getTypeName(project.project_type).toLowerCase().includes(query) ||
           project.dev_device_path?.toLowerCase().includes(query) ||
           project.project_url?.toLowerCase().includes(query);
  });

  const projectsByType: ProjectsByType = filteredProjects.reduce((acc, project) => {
    const typeKey = project.project_type?.toString() || 'uncategorized';
    const typeName = getTypeName(project.project_type);
    if (!acc[typeKey]) {
      acc[typeKey] = [];
    }
    acc[typeKey].push(project);
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

  const handleTogglePin = async (e: React.MouseEvent, projectId: number, isPinned: boolean) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-pin' }),
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
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
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
        <FolderGit2 className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">项目导航</h2>
      </div>

      {/* Search Input */}
      <div className="mb-3 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索项目..."
          className="w-full pl-9 pr-9 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {Object.entries(projectsByType)
          .sort(([aKey], [bKey]) => {
            // Get type objects to access sort_order
            const aType = projectTypes.find(t => t.id.toString() === aKey);
            const bType = projectTypes.find(t => t.id.toString() === bKey);
            
            // Uncategorized goes last
            if (aKey === 'uncategorized') return 1;
            if (bKey === 'uncategorized') return -1;
            
            // Sort by sort_order if both types exist
            if (aType && bType) {
              return aType.sort_order - bType.sort_order;
            }
            
            // Fallback to alphabetical by name
            const aName = getTypeName(aKey);
            const bName = getTypeName(bKey);
            return aName.localeCompare(bName);
          })
          .map(([typeKey, typeProjects]) => {
            const typeName = getTypeName(typeKey === 'uncategorized' ? null : typeKey);
            return (
              <div key={typeKey}>
                <button
                  onClick={() => toggleType(typeKey)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {expandedTypes.has(typeKey) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="flex-1 text-left">{typeName}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {typeProjects.length}
                  </span>
                </button>

            {expandedTypes.has(typeKey) && (
              <div className="ml-6 mt-1 space-y-1">
                {typeProjects
                  .sort((a, b) => {
                    // Pinned projects first
                    if (a.is_pinned && !b.is_pinned) return -1;
                    if (!a.is_pinned && b.is_pinned) return 1;
                    // Within same pinned status, sort by name
                    return a.name.localeCompare(b.name, 'zh-CN');
                  })
                  .map((project) => (
                    <div
                      key={project.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => handleProjectClick(project.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          project.id.toString() === currentProjectId
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {project.is_pinned ? (
                            <Pin className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              project.id.toString() === currentProjectId
                                ? 'bg-indigo-600'
                                : 'bg-gray-300'
                            }`} />
                          )}
                          <span className="truncate flex-1">{project.name}</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleTogglePin(e, project.id, project.is_pinned || false)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-white rounded transition-all"
                        title={project.is_pinned ? '取消置顶' : '置顶'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${
                          project.is_pinned 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );
        })}
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">暂无项目</p>
      )}
      {projects.length > 0 && filteredProjects.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">未找到匹配的项目</p>
      )}
    </div>
  );
}
