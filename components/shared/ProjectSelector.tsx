'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

interface Project {
  id: number;
  name: string;
}

interface ProjectSelectorProps {
  value: number | null;
  onChange: (projectId: number | null, projectName: string | null) => void;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
}

export default function ProjectSelector({ 
  value, 
  onChange, 
  className = '',
  placeholder = '选择项目',
  allowClear = true 
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === value);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (project: Project | null) => {
    if (project) {
      onChange(project.id, project.name);
    } else {
      onChange(null, null);
    }
    setIsOpen(false);
    setSearchText('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between text-gray-900"
      >
        <span className={selectedProject ? 'text-gray-900' : 'text-gray-400'}>
          {selectedProject ? selectedProject.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 min-w-max w-64 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索项目..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>无关联项目</span>
                {!selectedProject && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                )}
              </button>
            )}

            {loading ? (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                加载中...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                {searchText ? '未找到匹配的项目' : '暂无项目'}
              </div>
            ) : (
              filteredProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelect(project)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    project.id === value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                  }`}
                >
                  <span>{project.name}</span>
                  {project.id === value && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
