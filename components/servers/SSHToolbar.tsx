'use client';

import { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Power, RefreshCw, FolderOpen } from 'lucide-react';
import type { WebSSHTerminalHandle } from './WebSSHTerminal';

interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

interface SSHToolbarProps {
  server: Server;
  terminalRef: React.RefObject<WebSSHTerminalHandle>;
  onOpenFileBrowser?: () => void;
}

export default function SSHToolbar({ server, terminalRef, onOpenFileBrowser }: SSHToolbarProps) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // 定期更新状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (terminalRef.current) {
        setStatus(terminalRef.current.status);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [terminalRef]);

  const handleConnect = () => {
    terminalRef.current?.connect();
  };

  const handleDisconnect = () => {
    terminalRef.current?.disconnect();
  };

  const handleReconnect = () => {
    terminalRef.current?.reconnect();
  };

  return (
    <div className="flex items-center gap-3">
      <TerminalIcon className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-700">
        {server.username}@{server.host}:{server.port}
      </span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'connected'
              ? 'bg-green-500'
              : status === 'connecting'
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-500">
          {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中...' : '未连接'}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {status === 'disconnected' && (
          <button
            onClick={handleConnect}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            连接
          </button>
        )}
        {status === 'connected' && (
          <>
            <button
              onClick={onOpenFileBrowser}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
              title="文件传输"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              文件传输
            </button>
            <button
              onClick={handleReconnect}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重连
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              断开
            </button>
          </>
        )}
      </div>
    </div>
  );
}
