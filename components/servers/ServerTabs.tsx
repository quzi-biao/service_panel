'use client';

import { useState, useRef, useEffect } from 'react';
import { Terminal, Info } from 'lucide-react';
import WebSSHTerminal from './WebSSHTerminal';
import ServerInfo from './ServerInfo';
import SSHToolbar from './SSHToolbar';

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

interface ServerTabsProps {
  server: Server;
  onUpdateServer: (server: Server) => void;
  onDeleteServer: (serverId: number) => void;
}

export default function ServerTabs({ server, onUpdateServer, onDeleteServer }: ServerTabsProps) {
  const [activeTab, setActiveTab] = useState<'ssh' | 'info'>('ssh');
  const sshTerminalRef = useRef<any>(null);

  const tabs = [
    { id: 'ssh', label: 'WebSSH', icon: Terminal },
    { id: 'info', label: '服务器信息', icon: Info },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'ssh' | 'info')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* SSH Toolbar - 只在 SSH tab 激活时显示 */}
          {activeTab === 'ssh' && (
            <SSHToolbar 
              server={server}
              terminalRef={sshTerminalRef}
            />
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'ssh' && <WebSSHTerminal server={server} ref={sshTerminalRef} />}
        {activeTab === 'info' && (
          <div className="h-full overflow-y-auto p-6">
            <ServerInfo server={server} onUpdateServer={onUpdateServer} />
          </div>
        )}
      </div>
    </div>
  );
}
