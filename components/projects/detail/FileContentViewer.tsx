'use client';

import { useState } from 'react';
import { File, Loader2, Palette } from 'lucide-react';
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
}: FileContentViewerProps) {
  const language = selectedFile ? getLanguageFromExtension(selectedFile.file_name) : 'text';
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('VS Code Dark');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  return (
    <div className="col-span-9 bg-white rounded-lg shadow flex flex-col overflow-hidden">
      {selectedFile ? (
        <>
          {/* 固定的标题栏 */}
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{selectedFile.file_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedFile.file_path}</p>
                {selectedFile.file_md5 && (
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    MD5: {selectedFile.file_md5}
                  </p>
                )}
              </div>
              <div className="relative ml-4">
                <button
                  onClick={() => setShowThemeSelector(!showThemeSelector)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                  {selectedTheme}
                </button>
                {showThemeSelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-80 overflow-auto">
                    {Object.keys(themes).map((themeName) => (
                      <button
                        key={themeName}
                        onClick={() => {
                          setSelectedTheme(themeName as keyof typeof themes);
                          setShowThemeSelector(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          selectedTheme === themeName ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {themeName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* 可滚动的内容区域 */}
          <div className="flex-1 overflow-auto p-4">
            {loadingContent ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <SyntaxHighlighter
                language={language}
                style={themes[selectedTheme]}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  maxHeight: '100%',
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
