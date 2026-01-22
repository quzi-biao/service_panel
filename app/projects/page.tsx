'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ProjectBasicInput } from '@/types/project';
import { Plus, Settings } from 'lucide-react';
import Header from '@/components/shared/Header';
import ProjectBasicInfo from '@/components/projects/detail/ProjectBasicInfo';
import ProjectDeviceInfo from '@/components/projects/detail/ProjectDeviceInfo';
import ProjectMiddleware from '@/components/projects/detail/ProjectMiddleware';
import ProjectResources from '@/components/projects/detail/ProjectResources';
import ProjectPrompts from '@/components/projects/detail/ProjectPrompts';
import ProjectNavigation from '@/components/projects/ProjectNavigation';
import ProjectModal from '@/components/projects/ProjectModal';
import ProjectTypeManagement from '@/components/projects/ProjectTypeManagement';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, loading: projectsLoading, fetchProjects } = useProjects();
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTypeManagement, setShowTypeManagement] = useState(false);
  const [projectFormData, setProjectFormData] = useState<ProjectBasicInput>({
    name: '',
    project_type: '',
    description: '',
    project_url: '',
  });

  // 当项目列表加载完成后，自动选择第一个项目
  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && !currentProjectId) {
      handleProjectChange(projects[0].id);
    }
  }, [projectsLoading, projects, currentProjectId]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('项目不存在');
      }
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (projectId: number) => {
    const id = projectId.toString();
    setCurrentProjectId(id);
    fetchProject(id);
  };

  const handleUpdateBasicInfo = async (data: Partial<Project>) => {
    if (!currentProjectId) return;
    const response = await fetch(`/api/projects/${currentProjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      await fetchProject(currentProjectId);
    }
  };

  const getExtendedInfo = () => {
    if (!project?.extended_info) return { middleware: [], resources: [], prompts: [] };
    
    if (typeof project.extended_info === 'object') {
      return project.extended_info as any;
    }
    
    try {
      return JSON.parse(project.extended_info);
    } catch {
      return { middleware: [], resources: [], prompts: [] };
    }
  };

  const handleUpdateMiddleware = async (middleware: any[]) => {
    if (!currentProjectId) return;
    const extendedInfo = getExtendedInfo();
    const response = await fetch(`/api/projects/${currentProjectId}/extended`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ middleware, resources: extendedInfo.resources || [], prompts: extendedInfo.prompts || [] }),
    });
    if (response.ok) {
      await fetchProject(currentProjectId);
    }
  };

  const handleUpdateResources = async (resources: any[]) => {
    if (!currentProjectId) return;
    const extendedInfo = getExtendedInfo();
    const response = await fetch(`/api/projects/${currentProjectId}/extended`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ middleware: extendedInfo.middleware || [], resources, prompts: extendedInfo.prompts || [] }),
    });
    if (response.ok) {
      await fetchProject(currentProjectId);
    }
  };

  const handleUpdatePrompts = async (prompts: any[]) => {
    if (!currentProjectId) return;
    const extendedInfo = getExtendedInfo();
    const response = await fetch(`/api/projects/${currentProjectId}/extended`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ middleware: extendedInfo.middleware || [], resources: extendedInfo.resources || [], prompts }),
    });
    if (response.ok) {
      await fetchProject(currentProjectId);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectFormData),
      });
      
      if (response.ok) {
        const newProject = await response.json();
        handleCloseProjectModal();
        await fetchProjects();
        setCurrentProjectId(newProject.id.toString());
        await fetchProject(newProject.id.toString());
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setProjectFormData({
      name: '',
      project_type: '',
      description: '',
      project_url: '',
    });
  };

  const renderHeader = () => {
    if (!project) return null;

    return (
      <div className="mb-6 pb-6 border-b border-gray-200">
        <ProjectBasicInfo project={project} onUpdate={handleUpdateBasicInfo} />
      </div>
    );
  };

  const renderContent = () => {
    if (projectsLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载项目列表...</p>
          </div>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-600 mb-4">暂无项目</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              返回服务管理
            </button>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    if (error || !project) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || '项目不存在'}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ProjectDeviceInfo project={project} onUpdate={handleUpdateBasicInfo} />
          <ProjectPrompts project={project} onUpdate={handleUpdatePrompts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ProjectMiddleware project={project} onUpdate={handleUpdateMiddleware} />
          <ProjectResources project={project} onUpdate={handleUpdateResources} />
        </div>
      </div>
    );
  };

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProjectModal(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新建项目
          </button>
          <button
            onClick={() => setShowTypeManagement(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
            title="类型管理"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </Header>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            <aside className="w-64 flex-shrink-0">
              <ProjectNavigation 
                currentProjectId={currentProjectId || ''} 
                onProjectChange={handleProjectChange}
              />
            </aside>

            <main className="flex-1 min-w-0">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
                <div className="p-8">
                  {renderHeader()}
                  {renderContent()}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <ProjectModal
        show={showProjectModal}
        editingProject={null}
        formData={projectFormData}
        onClose={handleCloseProjectModal}
        onSubmit={handleProjectSubmit}
        onChange={setProjectFormData}
      />

      <ProjectTypeManagement
        show={showTypeManagement}
        onClose={() => setShowTypeManagement(false)}
        onTypesUpdated={() => {}}
      />
    </>
  );
}
