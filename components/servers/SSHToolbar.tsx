'use client';

import { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Power, RefreshCw, FolderOpen } from 'lucide-react';
import type { WebSSHTerminalHandle } from './WebSSHTerminal';
import type { Server } from '@/types/server';

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
    <div className="flex items-center gap-2 md:gap-3">
      {/* 终端图标 - 移动端隐藏 */}
      <TerminalIcon className="hidden md:block w-4 h-4 text-gray-500" />
      
      {/* 服务器信息 - 移动端简化显示 */}
      <span className="text-xs md:text-sm text-gray-700 truncate">
        <span className="hidden sm:inline">{server.username}@</span>
        {server.host}
        <span className="hidden md:inline">:{server.port}</span>
      </span>
      
      {/* 连接状态 */}
      <div className="flex items-center gap-1 md:gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'connected'
              ? 'bg-green-500'
              : status === 'connecting'
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-red-500'
          }`}
        />
        <span className="hidden sm:inline text-xs text-gray-500">
          {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中...' : '未连接'}
        </span>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex items-center gap-1 md:gap-2 ml-auto">
        {status === 'disconnected' && (
          <button
            onClick={handleConnect}
            className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            title="连接"
          >
            <Power className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">连接</span>
          </button>
        )}
        {status === 'connected' && (
          <>
            <button
              onClick={onOpenFileBrowser}
              className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
              title="文件传输"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">文件传输</span>
            </button>
            <button
              onClick={handleReconnect}
              className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              title="重连"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">重连</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1 px-2 md:px-2.5 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              title="断开"
            >
              <Power className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">断开</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
