'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import WebSSHTerminal from './WebSSHTerminal';
import SSHToolbar from './SSHToolbar';
import { Server } from '@/types/server';

interface ServerTabsProps {
  server: Server;
  autoConnect?: boolean;
  onUpdateServer: (server: Server) => void;
  onDeleteServer: (serverId: number) => void;
}

interface SSHTab {
  id: string;
  server: Server;
  ref: React.RefObject<any>;
}

export default function ServerTabs({ server, autoConnect = false, onUpdateServer, onDeleteServer }: ServerTabsProps) {
  const [tabs, setTabs] = useState<SSHTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [autoConnectTabId, setAutoConnectTabId] = useState<string | null>(null);
  const prevServerIdRef = useRef<number | null>(null);

  // 当选择新服务器时，添加或切换到对应的 tab
  useEffect(() => {
    const tabId = `ssh-${server.id}`;
    
    // 检查是否真的是新的服务器
    const isNewServer = prevServerIdRef.current !== server.id;
    prevServerIdRef.current = server.id;
    
    setTabs(prev => {
      const existingTab = prev.find(t => t.id === tabId);
      
      if (existingTab) {
        // 如果 tab 已存在，只切换到该 tab
        setActiveTabId(tabId);
        return prev;
      } else if (isNewServer) {
        // 只有在真正切换服务器时才创建新 tab
        const newTab: SSHTab = {
          id: tabId,
          server: server,
          ref: { current: null },
        };
        setActiveTabId(tabId);
        return [...prev, newTab];
      }
      return prev;
    });
  }, [server.id]);

  // 单独处理自动连接逻辑
  useEffect(() => {
    if (autoConnect) {
      const tabId = `ssh-${server.id}`;
      setAutoConnectTabId(tabId);
    }
  }, [server.id, autoConnect]);

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    // 如果关闭的是当前激活的 tab，切换到相邻的 tab
    if (activeTabId === tabId && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTabId === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium">{tab.server.name}</span>
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="hover:bg-gray-200 rounded p-0.5 transition-colors"
                  title="关闭"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </button>
            ))}
          </div>
          
          {/* SSH Toolbar - 显示当前激活 tab 的服务器信息 */}
          {activeTab && (
            <SSHToolbar 
              server={activeTab.server}
              terminalRef={activeTab.ref}
            />
          )}
        </div>
      </div>

      {/* Tab Content - 使用 display:none 而不是条件渲染，保持所有连接 */}
      <div className="flex-1 overflow-hidden relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className="absolute inset-0"
            style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
          >
            <WebSSHTerminal 
              server={tab.server} 
              ref={tab.ref}
              autoConnect={autoConnectTabId === tab.id}
              onConnected={() => setAutoConnectTabId(null)}
            />
          </div>
        ))}
        
        {tabs.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>请从左侧选择一个服务器</p>
          </div>
        )}
      </div>
    </div>
  );
}
