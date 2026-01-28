'use client';

import { useState, useRef } from 'react';
import { Plus, Menu } from 'lucide-react';
import Header from '@/components/shared/Header';
import ServerNavigation, { ServerNavigationHandle } from '@/components/servers/ServerNavigation';
import ServerTabs from '@/components/servers/ServerTabs';
import AddServerDialog from '@/components/servers/AddServerDialog';

interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  private_key: string | null;
  auth_method: 'password' | 'private_key';
  primary_tag: string | null;
  tags: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function ServersPage() {
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [autoConnect, setAutoConnect] = useState(false);
  const serverNavigationRef = useRef<ServerNavigationHandle>(null);

  const handleServerChange = (server: Server, shouldAutoConnect: boolean = false) => {
    setSelectedServer(server);
    setAutoConnect(shouldAutoConnect);
  };

  const handleAddServer = async (serverData: any) => {
    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverData),
      });

      const data = await response.json();
      if (data.success && data.server) {
        setSelectedServer(data.server);
        setShowAddDialog(false);
        // 只刷新服务器导航列表
        await serverNavigationRef.current?.refresh();
      } else {
        alert('添加服务器失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding server:', error);
      alert('添加服务器失败');
    }
  };

  const handleUpdateServer = async (updatedServer: Server) => {
    try {
      const response = await fetch(`/api/servers/${updatedServer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedServer),
      });

      const data = await response.json();
      if (data.success && data.server) {
        setSelectedServer(data.server);
        // 只刷新服务器导航列表
        await serverNavigationRef.current?.refresh();
      } else {
        alert('更新服务器失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating server:', error);
      alert('更新服务器失败');
    }
  };

  const handleDeleteServer = async (serverId: number) => {
    if (!confirm('确定要删除这个服务器吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        if (selectedServer?.id === serverId) {
          setSelectedServer(null);
        }
        // 只刷新服务器导航列表
        await serverNavigationRef.current?.refresh();
      } else {
        alert('删除服务器失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('删除服务器失败');
    }
  };

  return (
    <>
      <Header>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden inline-flex items-center px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
            title="服务器列表"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
            title="添加服务器"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </Header>
      
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="h-[calc(100vh-64px)]">
          <div className="flex h-full overflow-hidden">
            {/* 桌面端导航 */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <ServerNavigation
                ref={serverNavigationRef}
                currentServerId={selectedServer?.id || null}
                onServerChange={handleServerChange}
              />
            </aside>

            {/* 主内容区 */}
            <main className="flex-1 min-w-0 h-full">
              {selectedServer ? (
                <ServerTabs
                  server={selectedServer}
                  autoConnect={autoConnect}
                  onUpdateServer={handleUpdateServer}
                  onDeleteServer={handleDeleteServer}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-white/60 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-gray-600">请从左侧选择一个服务器</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Add Server Dialog */}
      {showAddDialog && (
        <AddServerDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddServer}
        />
      )}
    </>
  );
}
