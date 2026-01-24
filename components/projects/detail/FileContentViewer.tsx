'use client';

import { useState } from 'react';
import { File, Loader2, Palette, X } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { 
  vscDarkPlus,
  oneDark,
  atomDark,
  tomorrow,
  okaidia,
  solarizedlight,
  vs,
  materialLight,
  materialDark,
  dracula
} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ProjectFile {
  id: number;
  project_id: number;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_md5: string | null;
  is_directory: boolean;
  parent_path: string | null;
}

interface FileContentViewerProps {
  selectedFile: ProjectFile | null;
  fileContent: string;
  loadingContent: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  theme?: keyof typeof themes;
  className?: string;
}

// 根据文件扩展名获取语言类型
const getLanguageFromExtension = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: { [key: string]: string } = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Java
    'java': 'java',
    
    // Python
    'py': 'python',
    'pyw': 'python',
    
    // C/C++
    'c': 'c',
    'h': 'c',
    'cpp': 'cpp',
    'hpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    
    // C#
    'cs': 'csharp',
    
    // Go
    'go': 'go',
    
    // Rust
    'rs': 'rust',
    
    // PHP
    'php': 'php',
    
    // Ruby
    'rb': 'ruby',
    
    // Shell
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    
    // Config
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    
    // Markdown
    'md': 'markdown',
    'markdown': 'markdown',
    
    // SQL
    'sql': 'sql',
    
    // Docker
    'dockerfile': 'docker',
    
    // Other
    'graphql': 'graphql',
    'proto': 'protobuf',
  };
  
  return languageMap[ext] || 'text';
};

const themes = {
  'VS Code Dark': vscDarkPlus,
  'One Dark': oneDark,
  'Atom Dark': atomDark,
  'Tomorrow': tomorrow,
  'Okaidia': okaidia,
  'Solarized Light': solarizedlight,
  'VS Light': vs,
  'Material Light': materialLight,
  'Material Dark': materialDark,
  'Dracula': dracula,
};

export default function FileContentViewer({
  selectedFile,
  fileContent,
  loadingContent,
  showCloseButton = false,
  onClose,
  theme = 'VS Light',
  className = ''
}: FileContentViewerProps) {
  const language = selectedFile ? getLanguageFromExtension(selectedFile.file_name) : 'text';
  
  return (
    <div className={`h-full bg-white rounded-lg shadow flex flex-col overflow-hidden ${className}`}>
      {selectedFile ? (
        <>
          {/* 固定的标题栏 */}
          {showCloseButton && onClose && (
            <div className="p-4 border-b flex-shrink-0">
              <div className="flex items-start justify-between">
                <button
                  onClick={onClose}
                  className="ml-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
           
          {/* 可滚动的内容区域 */}
          <div className="flex-1 overflow-auto">
            {loadingContent ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <SyntaxHighlighter
                language={language}
                style={themes[theme]}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: 0,
                  fontSize: '0.875rem',
                  maxHeight: '100%',
                  border: '1px #f6f6f6 solid'
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }
                }}
              >
                {fileContent || ''}
              </SyntaxHighlighter>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <File className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>选择一个文件查看内容</p>
          </div>
        </div>
      )}
    </div>
  );
}
