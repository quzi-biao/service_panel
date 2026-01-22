'use client';

import { useState, useEffect } from 'react';
import { Service, ServiceInput } from '@/types/service';
import { Project, ProjectBasicInput, ProjectExtendedInput } from '@/types/project';
import { Plus } from 'lucide-react';

import { useServices } from '@/hooks/useServices';
import { useProjects } from '@/hooks/useProjects';
import { useContextMenu } from '@/hooks/useContextMenu';

import TabSwitcher from '@/components/shared/TabSwitcher';
import SearchBar from '@/components/shared/SearchBar';

import ServiceGrid from '@/components/services/ServiceGrid';
import ServiceModal from '@/components/services/ServiceModal';
import ServiceDetailModal from '@/components/services/ServiceDetailModal';
import ServiceContextMenu from '@/components/services/ServiceContextMenu';

import ProjectGrid from '@/components/projects/ProjectGrid';
import ProjectModal from '@/components/projects/ProjectModal';
import ProjectExtendedModal from '@/components/projects/ProjectExtendedModal';
import ProjectDetailModal from '@/components/projects/ProjectDetailModal';
import ProjectContextMenu from '@/components/projects/ProjectContextMenu';
import ProjectTypeFilter from '@/components/projects/ProjectTypeFilter';

type TabType = 'services' | 'projects';

const TAB_CACHE_KEY = 'service-panel-active-tab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState<string | null>(null);

  // 从 localStorage 恢复 tab 状态
  useEffect(() => {
    const cachedTab = localStorage.getItem(TAB_CACHE_KEY) as TabType | null;
    if (cachedTab && (cachedTab === 'services' || cachedTab === 'projects')) {
      setActiveTab(cachedTab);
    }
  }, []);

  // 保存 tab 状态到 localStorage
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem(TAB_CACHE_KEY, tab);
  };

  const {
    services,
    loading: servicesLoading,
    createService,
    updateService,
    deleteService,
    togglePin: toggleServicePin,
  } = useServices();

  const {
    projects,
    loading: projectsLoading,
    createProject,
    updateProject,
    updateProjectExtended,
    fetchProjectExtended,
    deleteProject,
    togglePin: toggleProjectPin,
  } = useProjects();

  const {
    contextMenu: serviceContextMenu,
    openContextMenu: openServiceContextMenu,
    closeContextMenu: closeServiceContextMenu,
  } = useContextMenu<Service>();

  const {
    contextMenu: projectContextMenu,
    openContextMenu: openProjectContextMenu,
    closeContextMenu: closeProjectContextMenu,
  } = useContextMenu<Project>();

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceFormData, setServiceFormData] = useState<ServiceInput>({
    name: '',
    url: '',
    username: '',
    password: '',
    description: '',
  });

  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [detailService, setDetailService] = useState<Service | null>(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectExtendedModal, setShowProjectExtendedModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectFormData, setProjectFormData] = useState<ProjectBasicInput>({
    name: '',
    project_type: '',
    description: '',
    project_url: '',
    dev_device_name: '',
    dev_device_path: '',
    deploy_server: '',
    service_urls: [],
  });
  const [projectExtendedData, setProjectExtendedData] = useState<ProjectExtendedInput>({
    extended_info: '',
    middleware: [],
    resources: [],
  });

  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const [serviceUrlInput, setServiceUrlInput] = useState('');
  const [middlewareInput, setMiddlewareInput] = useState({ middleware_name: '', middleware_config: '' });
  const [resourceInput, setResourceInput] = useState({ resource_name: '', resource_description: '' });

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingService
      ? await updateService(editingService.id, serviceFormData)
      : await createService(serviceFormData);
    
    if (success) {
      handleCloseServiceModal();
    }
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setEditingService(null);
    setServiceFormData({
      name: '',
      url: '',
      username: '',
      password: '',
      description: '',
    });
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      url: service.url,
      username: service.username || '',
      password: service.password || '',
      description: service.description || '',
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('确定要删除这个服务吗？')) return;
    await deleteService(id);
  };

  const handleViewServiceDetail = (service: Service) => {
    setDetailService(service);
    setShowServiceDetailModal(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editingProject
      ? await updateProject(editingProject.id, projectFormData)
      : await createProject(projectFormData);
    
    if (success) {
      handleCloseProjectModal();
    }
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
    setProjectFormData({
      name: '',
      project_type: '',
      description: '',
      project_url: '',
      dev_device_name: '',
      dev_device_path: '',
      deploy_server: '',
      service_urls: [],
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      project_type: project.project_type,
      description: project.description || '',
      project_url: project.project_url || '',
      dev_device_name: project.dev_device_name || '',
      dev_device_path: project.dev_device_path || '',
      deploy_server: project.deploy_server || '',
      service_urls: project.service_urls ? JSON.parse(project.service_urls as any) : [],
    });
    setShowProjectModal(true);
  };

  const handleEditProjectExtended = async (project: Project) => {
    setEditingProject(project);
    const data = await fetchProjectExtended(project.id);
    if (data) {
      setProjectExtendedData({
        extended_info: data.extended_info || '',
        middleware: data.middleware || [],
        resources: data.resources || [],
      });
      setShowProjectExtendedModal(true);
    }
  };

  const handleProjectExtendedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    
    const success = await updateProjectExtended(editingProject.id, projectExtendedData);
    if (success) {
      handleCloseProjectExtendedModal();
    }
  };

  const handleCloseProjectExtendedModal = () => {
    setShowProjectExtendedModal(false);
    setEditingProject(null);
    setProjectExtendedData({
      extended_info: '',
      middleware: [],
      resources: [],
    });
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('确定要删除这个项目吗？')) return;
    await deleteProject(id);
  };

  const handleViewProjectDetail = (project: Project) => {
    setDetailProject(project);
    setShowProjectDetailModal(true);
  };

  const addServiceUrl = () => {
    if (serviceUrlInput.trim()) {
      setProjectFormData({
        ...projectFormData,
        service_urls: [...(projectFormData.service_urls || []), serviceUrlInput.trim()]
      });
      setServiceUrlInput('');
    }
  };

  const removeServiceUrl = (index: number) => {
    const newUrls = [...(projectFormData.service_urls || [])];
    newUrls.splice(index, 1);
    setProjectFormData({ ...projectFormData, service_urls: newUrls });
  };

  const addMiddleware = () => {
    if (middlewareInput.middleware_name.trim()) {
      setProjectExtendedData({
        ...projectExtendedData,
        middleware: [...(projectExtendedData.middleware || []), { ...middlewareInput }]
      });
      setMiddlewareInput({ middleware_name: '', middleware_config: '' });
    }
  };

  const removeMiddleware = (index: number) => {
    const newMiddleware = [...(projectExtendedData.middleware || [])];
    newMiddleware.splice(index, 1);
    setProjectExtendedData({ ...projectExtendedData, middleware: newMiddleware });
  };

  const addResource = () => {
    if (resourceInput.resource_name.trim()) {
      setProjectExtendedData({
        ...projectExtendedData,
        resources: [...(projectExtendedData.resources || []), { ...resourceInput }]
      });
      setResourceInput({ resource_name: '', resource_description: '' });
    }
  };

  const removeResource = (index: number) => {
    const newResources = [...(projectExtendedData.resources || [])];
    newResources.splice(index, 1);
    setProjectExtendedData({ ...projectExtendedData, resources: newResources });
  };

  const openService = (url: string) => {
    window.open(url, '_blank');
  };

  const openProject = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.url.toLowerCase().includes(query) ||
      (service.username && service.username.toLowerCase().includes(query))
    );
  });

  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query)) ||
      (project.project_url && project.project_url.toLowerCase().includes(query))
    );
    const matchesType = selectedProjectType === null || project.project_type === selectedProjectType;
    return matchesSearch && matchesType;
  });

  const projectTypes = Array.from(new Set(projects.map(p => p.project_type))).sort();
  const projectTypeCounts = projects.reduce((acc, project) => {
    acc[project.project_type] = (acc[project.project_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const loading = servicesLoading || projectsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <TabSwitcher activeTab={activeTab} onTabChange={handleTabChange} />

            <button
              onClick={() => activeTab === 'services' ? setShowServiceModal(true) : setShowProjectModal(true)}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 'services' ? '添加服务' : '添加项目'}
            </button>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={activeTab === 'services' ? '搜索服务名称、地址或用户名...' : '搜索项目名称、描述或链接...'}
          />
        </div>

        {activeTab === 'services' && (
          <ServiceGrid
            services={services}
            filteredServices={filteredServices}
            searchQuery={searchQuery}
            onServiceClick={openService}
            onContextMenu={openServiceContextMenu}
          />
        )}

        {activeTab === 'projects' && (
          <>
            <ProjectTypeFilter
              projectTypes={projectTypes}
              selectedType={selectedProjectType}
              onTypeSelect={setSelectedProjectType}
              projectCounts={projectTypeCounts}
            />
            <ProjectGrid
              projects={projects}
              filteredProjects={filteredProjects}
              searchQuery={searchQuery}
              onContextMenu={openProjectContextMenu}
            />
          </>
        )}

        <ServiceModal
          show={showServiceModal}
          editingService={editingService}
          formData={serviceFormData}
          onClose={handleCloseServiceModal}
          onSubmit={handleServiceSubmit}
          onChange={setServiceFormData}
        />

        <ServiceDetailModal
          show={showServiceDetailModal}
          service={detailService}
          onClose={() => setShowServiceDetailModal(false)}
          onOpenService={openService}
        />

        <ServiceContextMenu
          contextMenu={serviceContextMenu}
          onViewDetail={handleViewServiceDetail}
          onTogglePin={toggleServicePin}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          onClose={closeServiceContextMenu}
        />

        <ProjectModal
          show={showProjectModal}
          editingProject={editingProject}
          formData={projectFormData}
          serviceUrlInput={serviceUrlInput}
          onClose={handleCloseProjectModal}
          onSubmit={handleProjectSubmit}
          onChange={setProjectFormData}
          onServiceUrlInputChange={setServiceUrlInput}
          onAddServiceUrl={addServiceUrl}
          onRemoveServiceUrl={removeServiceUrl}
        />

        <ProjectExtendedModal
          show={showProjectExtendedModal}
          editingProject={editingProject}
          extendedData={projectExtendedData}
          middlewareInput={middlewareInput}
          resourceInput={resourceInput}
          onClose={handleCloseProjectExtendedModal}
          onSubmit={handleProjectExtendedSubmit}
          onExtendedDataChange={setProjectExtendedData}
          onMiddlewareInputChange={setMiddlewareInput}
          onResourceInputChange={setResourceInput}
          onAddMiddleware={addMiddleware}
          onRemoveMiddleware={removeMiddleware}
          onAddResource={addResource}
          onRemoveResource={removeResource}
        />

        <ProjectDetailModal
          show={showProjectDetailModal}
          project={detailProject}
          onClose={() => setShowProjectDetailModal(false)}
          onOpenProject={openProject}
        />

        <ProjectContextMenu
          contextMenu={projectContextMenu}
          onViewDetail={handleViewProjectDetail}
          onTogglePin={toggleProjectPin}
          onEdit={handleEditProject}
          onEditExtended={handleEditProjectExtended}
          onDelete={handleDeleteProject}
          onClose={closeProjectContextMenu}
        />
      </div>
    </div>
  );
}
