'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import FileContentViewer from '@/components/projects/detail/FileContentViewer';
import { ArrowLeft, RefreshCw, Loader2, X } from 'lucide-react';

declare global {
  interface Window {
    ZoomChartsLicense?: string;
    ZoomChartsLicenseKey?: string;
    ZoomCharts?: any;
  }
}

interface GraphNode {
  id: string;
  label: string;
  filePath: string;
}

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

interface GraphLink {
  from: string;
  to: string;
  type: string;
  lineNumber: number;
}

export default function FileGraphPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [chartInstance, setChartInstance] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  useEffect(() => {
    loadGraphData();
  }, [projectId]);

  useEffect(() => {
    if (graphData && chartRef.current && !chartInstance) {
      initializeChart();
    }
  }, [graphData, chartInstance]);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/file-graph/data`);
      const data = await response.json();

      if (data.success) {
        setGraphData({ nodes: data.nodes, links: data.links });
      } else {
        console.error('Failed to load graph data:', data.error);
      }
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildGraph = async () => {
    if (!confirm('构建文件关系图谱将分析所有文件，这可能需要一些时间。是否继续？')) {
      return;
    }

    try {
      setBuilding(true);
      const response = await fetch(`/api/projects/${projectId}/file-graph/build`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        alert(`图谱构建完成！\n节点数: ${result.nodesCount}\n关系数: ${result.relationsCount}`);
        await loadGraphData();
      } else {
        alert('构建失败: ' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('Error building graph:', error);
      alert('构建失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setBuilding(false);
    }
  };

  const fetchFileContent = async (fileId: string, nodeData: GraphNode) => {
    try {
      setLoadingContent(true);
      const response = await fetch(`/api/projects/${projectId}/files/${fileId}/content`);
      const data = await response.json();

      if (data.content) {
        setFileContent(data.content);
      } else if (data.error) {
        setFileContent(`错误: ${data.error}`);
      }

      // Convert GraphNode to ProjectFile format for FileContentViewer
      const projectFile: ProjectFile = {
        id: parseInt(fileId),
        project_id: parseInt(projectId),
        file_path: nodeData.filePath,
        file_name: nodeData.label,
        file_size: 0,
        file_type: nodeData.label.split('.').pop() || '',
        file_md5: null,
        is_directory: false,
        parent_path: nodeData.filePath.split('/').slice(0, -1).join('/') || null,
      };
      setSelectedFile(projectFile);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent('加载文件内容失败');
    } finally {
      setLoadingContent(false);
    }
  };

  const initializeChart = () => {
    if (!chartRef.current || !graphData) return;
     // 设置 ZoomCharts 许可证密钥（在加载脚本之前）
    window.ZoomChartsLicense = 'ZCF-xxxxxxxxxx-xxxxx';
    window.ZoomChartsLicenseKey = 'your-license-key-here';

    // 动态加载 ZoomCharts
    if (typeof window !== 'undefined' && (window as any).ZoomCharts) {
      const ZoomCharts = (window as any).ZoomCharts;
      
      // 关系类型颜色映射
      const relationColorMap: Record<string, string> = {
        'IMPORTS': '#3b82f6',      // 蓝色
        'EXTENDS': '#10b981',      // 绿色
        'IMPLEMENTS': '#8b5cf6',   // 紫色
        'REQUIRES': '#f59e0b',     // 橙色
        'INCLUDES': '#ec4899',     // 粉色
        'REFERENCES': '#6366f1',   // 靛蓝色
      };

      // 准备图谱数据
      const nodes = graphData.nodes.map(node => ({
        id: node.id,
        loaded: true,
        style: {
            label: node.label
        },
        data: node
      }));

      // 创建节点 ID 集合用于验证
      const nodeIds = new Set(nodes.map(n => n.id));

      // 去重：使用 Map 存储唯一的关系
      const uniqueLinksMap = new Map<string, any>();
      
      graphData.links.forEach(link => {
        // 验证链接的两端节点都存在
        if (!nodeIds.has(link.from) || !nodeIds.has(link.to)) {
          console.warn(`Skipping invalid link: ${link.from} -> ${link.to} (node not found)`);
          return;
        }

        // 使用 from-to-type 作为唯一键，确保同一对节点间相同类型的关系只保留一个
        const linkKey = `${link.from}-${link.to}-${link.type}`;
        
        if (!uniqueLinksMap.has(linkKey)) {
          uniqueLinksMap.set(linkKey, {
            id: linkKey,
            from: link.from,
            to: link.to,
            style: {
              label: link.type,
              fillColor: relationColorMap[link.type] || '#6b7280'
            }
          });
        }
      });
      
      const links = Array.from(uniqueLinksMap.values());

      // 创建图谱
      const chart = new ZoomCharts.NetChart({
        container: chartRef.current,
        area: { height: window.innerHeight - 150 },
        data: {
          preloaded: {
            nodes,
            links,
          },
        },
        style: {
          node: {
            fillColor: '#4F46E5',
            radius: 20,
          },
          link: {
            toDecoration: 'arrow',
          },
        },
        navigation: {
          initialNodes: nodes.length > 0 ? nodes.slice(0, Math.min(20, nodes.length)).map(n => n.id) : [],
        },
        layout: {
          mode: 'dynamic',
          nodeSpacing: 100,
        },
        info: {
          enabled: true,
          nodeContentsFunction: (data: any, node: any) => {
            try {
              if (data && data.data) {
                return `<div style="padding: 12px; min-width: 200px;">
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">文件名称</div>
                  <div style="font-size: 13px; margin-bottom: 12px; color: #374151;">${data.data.label || '未知'}</div>
                  <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1f2937;">文件路径</div>
                  <div style="font-size: 12px; color: #6b7280; word-break: break-all;">${data.data.filePath || '未知'}</div>
                </div>`;
              }
            } catch (error) {
              console.error('Error rendering node info:', error);
            }
            return '';
          },
        },
        events: {
          onClick: (event: any) => {
            try {
              if (event && event.clickNode && event.clickNode.data && event.clickNode.data.data) {
                const nodeData = event.clickNode.data.data;
                console.log('Clicked node:', nodeData);
                setShowSidePanel(true);
                fetchFileContent(nodeData.id, nodeData);
              }
            } catch (error) {
              console.error('Error handling click event:', error);
            }
          },
        },
      });

      setChartInstance(chart);
    }
  };

  useEffect(() => {
    // 加载 ZoomCharts CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/assets/zc.css';
    document.head.appendChild(link);

    // 加载 ZoomCharts 脚本
    const script = document.createElement('script');
    script.src = '/zoomcharts.js';
    script.async = true;
    script.onload = () => {
      if (graphData && chartRef.current && !chartInstance) {
        initializeChart();
      }
    };
    document.body.appendChild(script);

    return () => {
      if (chartInstance) {
        chartInstance.remove();
      }
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        leftContent={
          <>
            <button
              onClick={() => router.push(`/projects/${projectId}/files`)}
              className="p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white">文件关系图谱</h1>
            </div>
          </>
        }
        rightContent={
          <button
            onClick={buildGraph}
            disabled={building}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {building ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden md:inline">构建中...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">更新图谱</span>
              </>
            )}
          </button>
        }
      />

      <div className="max-w-full mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-150px)]">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : graphData && graphData.nodes.length > 0 ? (
          <div className="flex gap-4">
            <div className={`bg-white rounded-lg shadow p-4 transition-all duration-300 ${showSidePanel ? 'w-2/3' : 'w-full'}`}>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  节点数: {graphData.nodes.length} | 关系数: {graphData.links.length}
                </p>
              </div>
              <div ref={chartRef} className="w-full overflow-hidden" style={{ height: 'calc(100vh - 190px)' }} />
            </div>

            {showSidePanel && (
              <div className="w-1/3" style={{ height: 'calc(100vh - 120px)' }}>
                <FileContentViewer
                  selectedFile={selectedFile}
                  fileContent={fileContent}
                  loadingContent={loadingContent}
                  showCloseButton={true}
                  onClose={() => {
                    setShowSidePanel(false);
                    setSelectedFile(null);
                    setFileContent('');
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-160px)]">
            <div className="text-center">
              <p className="text-gray-500 mb-4">暂无图谱数据</p>
              <button
                onClick={buildGraph}
                disabled={building}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {building ? '构建中...' : '构建图谱'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
