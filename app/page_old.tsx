'use client';

import { useState, useEffect } from 'react';
import { Service, ServiceInput } from '@/types/service';
import { Project, ProjectBasicInput, ProjectExtendedInput, ProjectMiddleware, ProjectResource, ProjectPrompt } from '@/types/project';
import { Plus, ExternalLink, Edit, Trash2, X, Eye, EyeOff, Info, Pin, Search, FolderGit2, Server } from 'lucide-react';

type TabType = 'services' | 'projects';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; service: Service } | null>(null);
  const [formData, setFormData] = useState<ServiceInput>({
    name: '',
    url: '',
    username: '',
    password: '',
    description: '',
  });
  
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showProjectExtendedModal, setShowProjectExtendedModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [showProjectDetailModal, setShowProjectDetailModal] = useState(false);
  const [projectContextMenu, setProjectContextMenu] = useState<{ x: number; y: number; project: Project } | null>(null);
  const [projectFormData, setProjectFormData] = useState<ProjectBasicInput>({
    name: '',
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
  const [serviceUrlInput, setServiceUrlInput] = useState('');
  const [middlewareInput, setMiddlewareInput] = useState({ middleware_name: '', middleware_config: '' });
  const [resourceInput, setResourceInput] = useState({ resource_name: '', resource_description: '' });

  useEffect(() => {
    fetchServices();
    fetchProjects();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingService 
        ? `/api/services/${editingService.id}`
        : '/api/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchServices();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个服务吗？')) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      url: service.url,
      username: service.username || '',
      password: service.password || '',
      description: service.description || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      url: '',
      username: '',
      password: '',
      description: '',
    });
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const openService = (url: string) => {
    window.open(url, '_blank');
  };

  const handleViewDetail = (service: Service) => {
    setDetailService(service);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailService(null);
  };

  const handleContextMenu = (e: React.MouseEvent, service: Service) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      service,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    const handleScroll = () => closeContextMenu();
    
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenu]);

  const handleTogglePin = async (id: number) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle-pin' }),
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProject 
        ? `/api/projects/${editingProject.id}`
        : '/api/projects';
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectFormData),
      });

      if (response.ok) {
        await fetchProjects();
        handleCloseProjectModal();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleProjectDelete = async (id: number) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      description: project.description || '',
      project_url: project.project_url || '',
      dev_device_name: project.dev_device_name || '',
      dev_device_path: project.dev_device_path || '',
      deploy_server: project.deploy_server || '',
      service_urls: project.service_urls ? JSON.parse(project.service_urls as any) : [],
    });
    setShowProjectModal(true);
  };

  const handleCloseProjectModal = () => {
    setShowProjectModal(false);
    setEditingProject(null);
    setProjectFormData({
      name: '',
      description: '',
      project_url: '',
      dev_device_name: '',
      dev_device_path: '',
      deploy_server: '',
      service_urls: [],
    });
  };

  const handleProjectExtendedEdit = async (project: Project) => {
    setEditingProject(project);
    
    try {
      const response = await fetch(`/api/projects/${project.id}/extended`);
      const data = await response.json();
      setProjectExtendedData({
        extended_info: data.extended_info || '',
        middleware: data.middleware || [],
        resources: data.resources || [],
      });
      setShowProjectExtendedModal(true);
    } catch (error) {
      console.error('Error fetching extended info:', error);
    }
  };

  const handleProjectExtendedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProject) return;

    try {
      const response = await fetch(`/api/projects/${editingProject.id}/extended`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectExtendedData),
      });

      if (response.ok) {
        await fetchProjects();
        handleCloseProjectExtendedModal();
      }
    } catch (error) {
      console.error('Error saving extended info:', error);
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

  const handleToggleProjectPin = async (id: number) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle-pin' }),
      });

      if (response.ok) {
        await fetchProjects();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleProjectContextMenu = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectContextMenu({
      x: e.clientX,
      y: e.clientY,
      project,
    });
  };

  const closeProjectContextMenu = () => {
    setProjectContextMenu(null);
  };

  const handleViewProjectDetail = (project: Project) => {
    setDetailProject(project);
    setShowProjectDetailModal(true);
  };

  const handleCloseProjectDetailModal = () => {
    setShowProjectDetailModal(false);
    setDetailProject(null);
  };

  const openProject = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
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

  useEffect(() => {
    const handleClick = () => {
      closeContextMenu();
      closeProjectContextMenu();
    };
    const handleScroll = () => {
      closeContextMenu();
      closeProjectContextMenu();
    };
    
    if (contextMenu || projectContextMenu) {
      document.addEventListener('click', handleClick);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [contextMenu, projectContextMenu]);

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
    return (
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query)) ||
      (project.project_url && project.project_url.toLowerCase().includes(query))
    );
  });

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {activeTab === 'services' ? '服务管理面板' : '项目管理面板'}
              </h1>
              <p className="mt-2 text-gray-600">
                {activeTab === 'services' ? '统一管理所有服务的入口' : '统一管理所有项目的入口'}
              </p>
            </div>
            <button
              onClick={() => activeTab === 'services' ? setShowModal(true) : setShowProjectModal(true)}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              {activeTab === 'services' ? '添加服务' : '添加项目'}
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <Server className="w-5 h-5" />
              服务管理
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              <FolderGit2 className="w-5 h-5" />
              项目管理
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
            <input
              type="text"
              placeholder={activeTab === 'services' ? '搜索服务名称、地址或用户名...' : '搜索项目名称、描述或链接...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Services Grid */}
        {activeTab === 'services' && (
          <>
            {services.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">暂无服务，点击"添加服务"开始添加</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">没有找到匹配的服务</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => openService(service.url)}
                onContextMenu={(e) => handleContextMenu(e, service)}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer flex flex-col border hover:border-indigo-200 transform hover:-translate-y-1 relative ${
                  service.is_pinned ? 'border-yellow-300/50' : 'border-white/50'
                }`}
              >
                {service.is_pinned && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Pin className="w-3 h-3 fill-current" />
                    置顶
                  </div>
                )}
                <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all pr-16">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 truncate group-hover:text-indigo-600 transition-colors" title={service.url}>{service.url}</p>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Projects Grid */}
        {activeTab === 'projects' && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <p className="text-gray-500 text-lg">暂无项目，点击"添加项目"开始添加</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <p className="text-gray-500 text-lg">没有找到匹配的项目</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => project.project_url && openProject(project.project_url)}
                    onContextMenu={(e) => handleProjectContextMenu(e, project)}
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
            )}
          </>
        )}

        {/* Service Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingService ? '编辑服务' : '添加服务'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      服务名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="例如：开发环境"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      服务地址 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      登录用户名
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="可选"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      登录密码
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword['form-password'] ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="可选"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('form-password')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword['form-password'] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      服务介绍
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                      placeholder="简要描述这个服务的用途"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingService ? '保存' : '添加'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && detailService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">服务详情</h2>
                  <button
                    onClick={handleCloseDetailModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      服务名称
                    </label>
                    <p className="text-base text-gray-900">{detailService.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      服务地址
                    </label>
                    <p className="text-base text-gray-900 break-all">{detailService.url}</p>
                  </div>

                  {detailService.username && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        登录用户名
                      </label>
                      <p className="text-base text-gray-900">{detailService.username}</p>
                    </div>
                  )}

                  {detailService.password && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        登录密码
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-base text-gray-900 flex-1">
                          {showPassword[`detail-${detailService.id}`] ? detailService.password : '••••••••'}
                        </p>
                        <button
                          onClick={() => togglePasswordVisibility(`detail-${detailService.id}`)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword[`detail-${detailService.id}`] ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {detailService.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        服务介绍
                      </label>
                      <p className="text-base text-gray-900">{detailService.description}</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={() => openService(detailService.url)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      打开服务
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-100 py-2 z-50 min-w-[180px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                handleViewDetail(contextMenu.service);
                closeContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Info className="w-4 h-4" />
              查看详情
            </button>
            <button
              onClick={() => {
                handleTogglePin(contextMenu.service.id);
                closeContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Pin className={`w-4 h-4 ${contextMenu.service.is_pinned ? 'fill-current' : ''}`} />
              {contextMenu.service.is_pinned ? '取消置顶' : '置顶'}
            </button>
            <button
              onClick={() => {
                handleEdit(contextMenu.service);
                closeContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Edit className="w-4 h-4" />
              编辑
            </button>
            <div className="border-t border-gray-200 my-1.5 mx-2"></div>
            <button
              onClick={() => {
                handleDelete(contextMenu.service.id);
                closeContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        )}

        {/* Project Context Menu */}
        {projectContextMenu && (
          <div
            className="fixed bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-indigo-100 py-2 z-50 min-w-[180px]"
            style={{
              left: `${projectContextMenu.x}px`,
              top: `${projectContextMenu.y}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                handleViewProjectDetail(projectContextMenu.project);
                closeProjectContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Info className="w-4 h-4" />
              查看详情
            </button>
            <button
              onClick={() => {
                handleToggleProjectPin(projectContextMenu.project.id);
                closeProjectContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Pin className={`w-4 h-4 ${projectContextMenu.project.is_pinned ? 'fill-current' : ''}`} />
              {projectContextMenu.project.is_pinned ? '取消置顶' : '置顶'}
            </button>
            <button
              onClick={() => {
                handleProjectEdit(projectContextMenu.project);
                closeProjectContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Edit className="w-4 h-4" />
              编辑基础信息
            </button>
            <button
              onClick={() => {
                handleProjectExtendedEdit(projectContextMenu.project);
                closeProjectContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Edit className="w-4 h-4" />
              编辑扩展信息
            </button>
            <div className="border-t border-gray-200 my-1.5 mx-2"></div>
            <button
              onClick={() => {
                handleProjectDelete(projectContextMenu.project.id);
                closeProjectContextMenu();
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors rounded-lg mx-1"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        )}

        {/* Project Basic Info Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProject ? '编辑项目' : '添加项目'}
                  </h2>
                  <button
                    onClick={handleCloseProjectModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleProjectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={projectFormData.name}
                      onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="例如：电商平台"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目描述
                    </label>
                    <textarea
                      value={projectFormData.description}
                      onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
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
                      value={projectFormData.project_url}
                      onChange={(e) => setProjectFormData({ ...projectFormData, project_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        开发设备名称
                      </label>
                      <input
                        type="text"
                        value={projectFormData.dev_device_name}
                        onChange={(e) => setProjectFormData({ ...projectFormData, dev_device_name: e.target.value })}
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
                        value={projectFormData.dev_device_path}
                        onChange={(e) => setProjectFormData({ ...projectFormData, dev_device_path: e.target.value })}
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
                      value={projectFormData.deploy_server}
                      onChange={(e) => setProjectFormData({ ...projectFormData, deploy_server: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="例如：阿里云服务器"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      关联的服务地址
                    </label>
                    <div className="space-y-2">
                      {projectFormData.service_urls && projectFormData.service_urls.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {projectFormData.service_urls.map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={url}
                                readOnly
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                              />
                              <button
                                type="button"
                                onClick={() => removeServiceUrl(index)}
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
                          onChange={(e) => setServiceUrlInput(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="https://api.example.com"
                        />
                        <button
                          type="button"
                          onClick={addServiceUrl}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseProjectModal}
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
        )}

        {/* Project Extended Info Modal */}
        {showProjectExtendedModal && editingProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    编辑扩展信息 - {editingProject.name}
                  </h2>
                  <button
                    onClick={handleCloseProjectExtendedModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleProjectExtendedSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      扩展信息
                    </label>
                    <textarea
                      value={projectExtendedData.extended_info}
                      onChange={(e) => setProjectExtendedData({ ...projectExtendedData, extended_info: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                      placeholder="项目的其他扩展信息"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目依赖的中间件
                    </label>
                    <div className="space-y-2">
                      {projectExtendedData.middleware && projectExtendedData.middleware.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {projectExtendedData.middleware.map((item, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.middleware_name}</p>
                                  {item.middleware_config && (
                                    <p className="text-sm text-gray-600 mt-1">{item.middleware_config}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMiddleware(index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={middlewareInput.middleware_name}
                          onChange={(e) => setMiddlewareInput({ ...middlewareInput, middleware_name: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="中间件名称（如：Redis）"
                        />
                        <input
                          type="text"
                          value={middlewareInput.middleware_config}
                          onChange={(e) => setMiddlewareInput({ ...middlewareInput, middleware_config: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="配置信息"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addMiddleware}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        添加中间件
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目依赖的外部资源
                    </label>
                    <div className="space-y-2">
                      {projectExtendedData.resources && projectExtendedData.resources.length > 0 && (
                        <div className="space-y-2 mb-2">
                          {projectExtendedData.resources.map((item, index) => (
                            <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.resource_name}</p>
                                  {item.resource_description && (
                                    <p className="text-sm text-gray-600 mt-1">{item.resource_description}</p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeResource(index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={resourceInput.resource_name}
                          onChange={(e) => setResourceInput({ ...resourceInput, resource_name: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="资源名称（如：OSS存储）"
                        />
                        <input
                          type="text"
                          value={resourceInput.resource_description}
                          onChange={(e) => setResourceInput({ ...resourceInput, resource_description: e.target.value })}
                          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="资源描述"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addResource}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        添加资源
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseProjectExtendedModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Project Detail Modal */}
        {showProjectDetailModal && detailProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">项目详情</h2>
                  <button
                    onClick={handleCloseProjectDetailModal}
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
                    <p className="text-base text-gray-900">{detailProject.name}</p>
                  </div>

                  {detailProject.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        项目描述
                      </label>
                      <p className="text-base text-gray-900">{detailProject.description}</p>
                    </div>
                  )}

                  {detailProject.project_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        项目链接
                      </label>
                      <p className="text-base text-gray-900 break-all">{detailProject.project_url}</p>
                    </div>
                  )}

                  {detailProject.dev_device_name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        开发设备
                      </label>
                      <p className="text-base text-gray-900">{detailProject.dev_device_name}</p>
                    </div>
                  )}

                  {detailProject.dev_device_path && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        文件路径
                      </label>
                      <p className="text-base text-gray-900 font-mono text-sm">{detailProject.dev_device_path}</p>
                    </div>
                  )}

                  {detailProject.deploy_server && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        部署服务器
                      </label>
                      <p className="text-base text-gray-900">{detailProject.deploy_server}</p>
                    </div>
                  )}

                  {detailProject.service_urls && JSON.parse(detailProject.service_urls as any).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        关联的服务地址
                      </label>
                      <div className="space-y-1">
                        {JSON.parse(detailProject.service_urls as any).map((url: string, index: number) => (
                          <p key={index} className="text-base text-gray-900 break-all">{url}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailProject.project_url && (
                    <div className="pt-4">
                      <button
                        onClick={() => openProject(detailProject.project_url)}
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
        )}
      </div>
    </div>
  );
}
