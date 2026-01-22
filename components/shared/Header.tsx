'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Server, FolderGit2 } from 'lucide-react';

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isServicesActive = pathname === '/';
  const isProjectsActive = pathname?.startsWith('/projects');

  return (
    <header className="bg-black backdrop-blur-md shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white">
              服务面板
            </h1>
            
            <nav className="flex items-center gap-6">
              <button
                onClick={() => router.push('/')}
                className={`flex items-center gap-2 transition-colors ${
                  isServicesActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Server className="w-4 h-4" />
                <span className="font-medium">服务管理</span>
              </button>
              
              <button
                onClick={() => router.push('/projects')}
                className={`flex items-center gap-2 transition-colors ${
                  isProjectsActive
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span className="font-medium">项目管理</span>
              </button>
            </nav>
          </div>
          
          {children && (
            <div className="flex items-center gap-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
