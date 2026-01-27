'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Terminal as TerminalIcon, Power, RefreshCw } from 'lucide-react';
import 'xterm/css/xterm.css';

interface Server {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

interface WebSSHTerminalProps {
  server: Server;
}

export interface WebSSHTerminalHandle {
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  status: 'disconnected' | 'connecting' | 'connected';
}

const WebSSHTerminal = forwardRef<WebSSHTerminalHandle, WebSSHTerminalProps>(({ server }, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const xtermRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initTerminal = async () => {
      if (!terminalRef.current) return;

      try {
        // 动态导入 xterm 和相关插件
        const { Terminal } = await import('xterm');
        const { FitAddon } = await import('xterm-addon-fit');
        const { WebLinksAddon } = await import('xterm-addon-web-links');

        if (!mounted) return;

        // 创建终端实例
        const terminal = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
          theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            cursor: '#ffffff',
            //selection: 'rgba(255, 255, 255, 0.3)',
          },
          rows: 30,
          cols: 100,
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(webLinksAddon);

        terminal.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // 窗口大小调整
        const handleResize = () => {
          if (fitAddonRef.current) {
            fitAddonRef.current.fit();
            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('ssh-resize', {
                rows: terminal.rows,
                cols: terminal.cols,
              });
            }
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (err) {
        console.error('Failed to initialize terminal:', err);
        setError('终端初始化失败');
      }
    };

    initTerminal();

    return () => {
      mounted = false;
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connect = async () => {
    if (!xtermRef.current) {
      setError('终端未初始化');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);
      xtermRef.current.clear();
      xtermRef.current.writeln('正在连接到服务器...\r\n');

      // 动态导入 socket.io-client
      const { io } = await import('socket.io-client');

      const socket = io({
        path: '/socket.io',
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('ssh-connect', {
          host: server.host,
          port: server.port,
          username: server.username,
          password: server.password,
        });
      });

      socket.on('ssh-status', (data: { status: string }) => {
        if (data.status === 'connected') {
          setStatus('connected');
          xtermRef.current.writeln('已连接到服务器\r\n');
        } else if (data.status === 'disconnected') {
          setStatus('disconnected');
          xtermRef.current.writeln('\r\n连接已断开\r\n');
        }
      });

      socket.on('ssh-output', (data: string) => {
        if (xtermRef.current) {
          xtermRef.current.write(data);
        }
      });

      socket.on('ssh-error', (data: { message: string }) => {
        setError(data.message);
        setStatus('disconnected');
        xtermRef.current.writeln(`\r\n错误: ${data.message}\r\n`);
      });

      socket.on('disconnect', () => {
        setStatus('disconnected');
      });

      // 监听终端输入
      xtermRef.current.onData((data: string) => {
        if (socket.connected) {
          socket.emit('ssh-input', data);
        }
      });
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || '连接失败');
      setStatus('disconnected');
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.emit('ssh-disconnect');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setStatus('disconnected');
    if (xtermRef.current) {
      xtermRef.current.writeln('\r\n已断开连接\r\n');
    }
  };

  const reconnect = () => {
    disconnect();
    setTimeout(() => connect(), 500);
  };

  // 暴露方法和状态给父组件
  useImperativeHandle(ref, () => ({
    connect,
    disconnect,
    reconnect,
    status,
  }));

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border-b border-red-700 px-4 py-2">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Terminal */}
      <div ref={terminalRef} className="flex-1 p-2" />
    </div>
  );
});

export default WebSSHTerminal;
export type { WebSSHTerminalProps };
