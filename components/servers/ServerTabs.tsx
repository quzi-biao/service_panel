'use client';

import { useState } from 'react';
import { Terminal, Info } from 'lucide-react';
import WebSSHTerminal from './WebSSHTerminal';
import ServerInfo from './ServerInfo';

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
}

export default function ServerTabs({ server, onUpdateServer }: ServerTabsProps) {
  const [activeTab, setActiveTab] = useState<'ssh' | 'info'>('ssh');

  const tabs = [
    { id: 'ssh', label: 'WebSSH', icon: Terminal },
    { id: 'info', label: '服务器信息', icon: Info },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex items-center px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'ssh' | 'info')}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'ssh' && <WebSSHTerminal server={server} />}
        {activeTab === 'info' && (
          <ServerInfo server={server} onUpdateServer={onUpdateServer} />
        )}
      </div>
    </div>
  );
}
