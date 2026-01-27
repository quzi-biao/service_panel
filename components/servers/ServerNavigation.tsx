'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, HardDrive, Search, X } from 'lucide-react';

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

interface ServerNavigationProps {
  currentServerId: number | null;
  onServerChange: (server: Server) => void;
}

interface ServersByTag {
  [key: string]: Server[];
}

export default function ServerNavigation({ currentServerId, onServerChange }: ServerNavigationProps) {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServers(data.servers);
          
          // Auto-expand the tag of current server
          const currentServer = data.servers.find((s: Server) => s.id === currentServerId);
          if (currentServer) {
            setExpandedTags(new Set([currentServer.primary_tag || 'uncategorized']));
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter servers based on search query
  const filteredServers = servers.filter(server => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return server.name.toLowerCase().includes(query) ||
           server.host.toLowerCase().includes(query) ||
           server.username.toLowerCase().includes(query) ||
           server.primary_tag?.toLowerCase().includes(query) ||
           server.description?.toLowerCase().includes(query);
  });

  const serversByTag: ServersByTag = filteredServers.reduce((acc, server) => {
    const tagKey = server.primary_tag || 'uncategorized';
    if (!acc[tagKey]) {
      acc[tagKey] = [];
    }
    acc[tagKey].push(server);
    return acc;
  }, {} as ServersByTag);

  const toggleTag = (tag: string) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tag)) {
      newExpanded.delete(tag);
    } else {
      newExpanded.add(tag);
    }
    setExpandedTags(newExpanded);
  };

  const handleServerClick = (server: Server) => {
    onServerChange(server);
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
    <div className="bg-white h-full border-r border-gray-200 p-4 overflow-y-auto">
      {/* Search Input */}
      <div className="mb-3 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索服务器..."
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

      <div className="space-y-1 flex-1 overflow-y-auto">
        {Object.entries(serversByTag)
          .sort(([aKey], [bKey]) => {
            if (aKey === 'uncategorized') return 1;
            if (bKey === 'uncategorized') return -1;
            return aKey.localeCompare(bKey, 'zh-CN');
          })
          .map(([tagKey, tagServers]) => {
            const tagName = tagKey === 'uncategorized' ? '未分组' : tagKey;
            return (
              <div key={tagKey}>
                <button
                  onClick={() => toggleTag(tagKey)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {expandedTags.has(tagKey) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="flex-1 text-left">{tagName}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {tagServers.length}
                  </span>
                </button>

                {expandedTags.has(tagKey) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {tagServers
                      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
                      .map((server) => (
                        <div
                          key={server.id}
                          className="group relative"
                        >
                          <button
                            onClick={() => handleServerClick(server)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              server.id === currentServerId
                                ? 'bg-indigo-100 text-indigo-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                server.id === currentServerId
                                  ? 'bg-indigo-600'
                                  : 'bg-gray-300'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="truncate">{server.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {server.username}@{server.host}
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {servers.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">暂无服务器</p>
      )}
      {servers.length > 0 && filteredServers.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">未找到匹配的服务器</p>
      )}
    </div>
  );
}
