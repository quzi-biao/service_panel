'use client';

import { useState, useMemo } from 'react';
import { Search, Tag, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { Server } from '@/types/server';

interface ServerListProps {
  servers: Server[];
  selectedServer: Server | null;
  onSelectServer: (server: Server) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  filterTags: string[];
  onFilterTagsChange: (tags: string[]) => void;
  onDeleteServer: (serverId: number) => void;
}

export default function ServerList({
  servers,
  selectedServer,
  onSelectServer,
  searchText,
  onSearchChange,
  filterTags,
  onFilterTagsChange,
  onDeleteServer,
}: ServerListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['default']));

  // 获取所有可用的标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    servers.forEach(server => {
      if (server.tags) {
        server.tags.split(',').forEach(tag => tagSet.add(tag.trim()));
      }
    });
    return Array.from(tagSet).sort();
  }, [servers]);

  // 过滤和分组服务器
  const groupedServers = useMemo(() => {
    let filtered = servers;

    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(server =>
        server.name.toLowerCase().includes(searchText.toLowerCase()) ||
        server.host.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 标签过滤
    if (filterTags.length > 0) {
      filtered = filtered.filter(server => {
        if (!server.tags) return false;
        const serverTags = server.tags.split(',').map(t => t.trim());
        return filterTags.every(tag => serverTags.includes(tag));
      });
    }

    // 按主标签分组
    const groups: { [key: string]: Server[] } = {};
    filtered.forEach(server => {
      const group = server.primary_tag || '未分组';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(server);
    });

    return groups;
  }, [servers, searchText, filterTags]);

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleFilterTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      onFilterTagsChange(filterTags.filter(t => t !== tag));
    } else {
      onFilterTagsChange([...filterTags, tag]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索服务器..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">标签筛选</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleFilterTag(tag)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filterTags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Server Groups */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(groupedServers).length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p>没有找到服务器</p>
          </div>
        ) : (
          Object.entries(groupedServers).map(([group, groupServers]) => (
            <div key={group} className="border-b border-gray-200">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-900">{group}</span>
                  <span className="text-xs text-gray-500">({groupServers.length})</span>
                </div>
              </button>

              {/* Group Servers */}
              {expandedGroups.has(group) && (
                <div className="bg-gray-50">
                  {groupServers.map(server => (
                    <div
                      key={server.id}
                      className={`group px-4 py-3 cursor-pointer transition-colors ${
                        selectedServer?.id === server.id
                          ? 'bg-indigo-50 border-l-4 border-indigo-600'
                          : 'hover:bg-gray-100 border-l-4 border-transparent'
                      }`}
                      onClick={() => onSelectServer(server)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {server.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {server.username}@{server.host}:{server.port}
                          </div>
                          {server.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {server.tags.split(',').map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-white text-gray-600 rounded-full border border-gray-300"
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteServer(server.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                          title="删除服务器"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
