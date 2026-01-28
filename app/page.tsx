'use client';

import { useState } from 'react';
import { Service, ServiceInput } from '@/types/service';
import { Plus } from 'lucide-react';

import { useServices } from '@/hooks/useServices';
import { useContextMenu } from '@/hooks/useContextMenu';

import Header from '@/components/shared/Header';
import SearchBar from '@/components/shared/SearchBar';

import ServiceGrid from '@/components/services/ServiceGrid';
import ServiceModal from '@/components/services/ServiceModal';
import ServiceDetailModal from '@/components/services/ServiceDetailModal';
import ServiceContextMenu from '@/components/services/ServiceContextMenu';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    togglePin: toggleServicePin,
  } = useServices();

  const {
    contextMenu: serviceContextMenu,
    openContextMenu: openServiceContextMenu,
    closeContextMenu: closeServiceContextMenu,
  } = useContextMenu<Service>();

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

  const openService = async (url: string) => {
    // 检查是否在 Electron 环境中
    if (typeof window !== 'undefined' && (window as any).electron?.isElectron) {
      // 在 Electron 中使用默认浏览器打开
      try {
        await (window as any).electron.openExternal(url);
      } catch (error) {
        console.error('Failed to open URL in external browser:', error);
        // 如果失败，回退到 window.open
        window.open(url, '_blank');
      }
    } else {
      // 在浏览器中正常打开
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
    <>
      <Header>
        <button
          onClick={() => setShowServiceModal(true)}
          className="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          添加服务
        </button>
      </Header>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索服务名称、地址或用户名..."
            />
          </div>

          <ServiceGrid
            services={services}
            filteredServices={filteredServices}
            searchQuery={searchQuery}
            onServiceClick={openService}
            onContextMenu={openServiceContextMenu}
          />

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
        </div>
      </div>
    </>
  );
}
