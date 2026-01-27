'use client';

import { useState, useEffect } from 'react';
import { Plus, Server } from 'lucide-react';
import Header from '@/components/shared/Header';
import ServerList from '@/components/servers/ServerList';
import ServerTabs from '@/components/servers/ServerTabs';
import AddServerDialog from '@/components/servers/AddServerDialog';

interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  primary_tag: string | null;
  tags: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function ServersPage() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/servers');
      const data = await response.json();
      if (data.success) {
        setServers(data.servers);
        if (data.servers.length > 0 && !selectedServer) {
          setSelectedServer(data.servers[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
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
        setServers([...servers, data.server]);
        setSelectedServer(data.server);
        setShowAddDialog(false);
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
        setServers(servers.map(s => s.id === data.server.id ? data.server : s));
        setSelectedServer(data.server);
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
        const newServers = servers.filter(s => s.id !== serverId);
        setServers(newServers);
        if (selectedServer?.id === serverId) {
          setSelectedServer(newServers.length > 0 ? newServers[0] : null);
        }
      } else {
        alert('删除服务器失败: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('删除服务器失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header>
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加服务器
        </button>
      </Header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Server List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <ServerList
            servers={servers}
            selectedServer={selectedServer}
            onSelectServer={setSelectedServer}
            searchText={searchText}
            onSearchChange={setSearchText}
            filterTags={filterTags}
            onFilterTagsChange={setFilterTags}
            onDeleteServer={handleDeleteServer}
          />
        </div>

        {/* Right Content - Server Tabs */}
        <div className="flex-1 overflow-hidden">
          {selectedServer ? (
            <ServerTabs
              server={selectedServer}
              onUpdateServer={handleUpdateServer}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">请选择一个服务器</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Server Dialog */}
      {showAddDialog && (
        <AddServerDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddServer}
        />
      )}
    </div>
  );
}
