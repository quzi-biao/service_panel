'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { ArrowLeft } from 'lucide-react';
import ProjectBasicInfo from '@/components/projects/detail/ProjectBasicInfo';
import ProjectDeviceInfo from '@/components/projects/detail/ProjectDeviceInfo';
import ProjectMiddleware from '@/components/projects/detail/ProjectMiddleware';
import ProjectResources from '@/components/projects/detail/ProjectResources';
import ProjectPrompts from '@/components/projects/detail/ProjectPrompts';
import ProjectNavigation from '@/components/projects/ProjectNavigation';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentProjectId, setCurrentProjectId] = useState<string>(params.id as string);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      // Update URL without page refresh
      window.history.replaceState(null, '', `/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentProjectId) {
      fetchProject(currentProjectId);
    }
  }, [currentProjectId]);

  const handleProjectChange = (projectId: number) => {
    setCurrentProjectId(projectId.toString());
  };

  const handleUpdateBasicInfo = async (data: Partial<Project>) => {
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
    
    // Handle if extended_info is already an object
    if (typeof project.extended_info === 'object') {
      return project.extended_info as any;
    }
    
    // Handle if extended_info is a JSON string
    try {
      return JSON.parse(project.extended_info);
    } catch {
      return { middleware: [], resources: [], prompts: [] };
    }
  };

  const handleUpdateMiddleware = async (middleware: any[]) => {
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

  const renderHeader = () => {
    if (!project) return null;

    return (
      <div className="mb-6 pb-6 border-b border-gray-200">
        <ProjectBasicInfo project={project} onUpdate={handleUpdateBasicInfo} />
      </div>
    );
  };

  const renderContent = () => {
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
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              返回首页
            </button>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          返回项目列表
        </button>

        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <ProjectNavigation 
              currentProjectId={currentProjectId} 
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
  );
}
