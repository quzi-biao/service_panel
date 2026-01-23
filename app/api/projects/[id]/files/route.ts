import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 需要排除的目录和文件模式
const EXCLUDED_PATTERNS = [
  'node_modules',
  'dist',
  'build',
  'out',
  '.next',
  'target', // Java/Maven
  'bin', // Java/Gradle
  '.gradle',
  '.mvn',
  'vendor', // PHP
  '__pycache__', // Python
  '.pytest_cache',
  'venv',
  'env',
  '.venv',
  '.git',
  '.svn',
  '.hg',
  '.idea',
  '.vscode',
  '.DS_Store',
  'coverage',
  '.nyc_output',
  'logs',
  '*.log',
  '.cache',
  'tmp',
  'temp',
];

// 计算文件的 MD5
function calculateMD5(filePath: string): string | null {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (err) {
    console.error(`Error calculating MD5 for ${filePath}:`, err);
    return null;
  }
}

// 检查路径是否应该被排除
function shouldExclude(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return EXCLUDED_PATTERNS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(normalizedPath);
    }
    return normalizedPath.includes(`/${pattern}/`) || 
           normalizedPath.endsWith(`/${pattern}`) ||
           normalizedPath === pattern;
  });
}

// 递归扫描目录
async function scanDirectory(
  dirPath: string,
  projectId: number,
  basePath: string,
  parentPath: string = ''
): Promise<any[]> {
  const files: any[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');
      
      // 检查是否应该排除
      if (shouldExclude(relativePath) || shouldExclude(entry.name)) {
        continue;
      }
      
      const fileInfo = {
        project_id: projectId,
        file_path: relativePath,
        file_name: entry.name,
        is_directory: entry.isDirectory(),
        parent_path: parentPath,
        file_type: entry.isDirectory() ? 'directory' : path.extname(entry.name).slice(1) || 'file',
        file_size: 0,
        file_md5: null as string | null,
      };
      
      if (!entry.isDirectory()) {
        try {
          const stats = fs.statSync(fullPath);
          fileInfo.file_size = stats.size;
          
          // 计算 MD5（只对小于 100MB 的文件计算）
          if (stats.size < 100 * 1024 * 1024) {
            fileInfo.file_md5 = calculateMD5(fullPath);
          }
        } catch (err) {
          console.error(`Error getting stats for ${fullPath}:`, err);
        }
      }
      
      files.push(fileInfo);
      
      // 递归扫描子目录
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(
          fullPath,
          projectId,
          basePath,
          relativePath
        );
        files.push(...subFiles);
      }
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err);
  }
  
  return files;
}

// POST - 扫描并上传项目文件
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    // 获取项目信息
    const projects = await query(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    ) as any[];
    
    if (projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    const project = projects[0];
    const projectPath = project.dev_device_path;
    
    if (!projectPath || !fs.existsSync(projectPath)) {
      return NextResponse.json(
        { error: 'Project path not found or invalid' },
        { status: 400 }
      );
    }
    
    // 删除该项目的旧文件记录
    await query('DELETE FROM project_files WHERE project_id = ?', [projectId]);
    
    // 扫描目录
    console.log(`Scanning project directory: ${projectPath}`);
    const files = await scanDirectory(projectPath, projectId, projectPath);
    
    console.log(`Found ${files.length} files to upload`);
    
    // 批量插入文件记录
    if (files.length > 0) {
      const values = files.map(f => [
        f.project_id,
        f.file_path,
        f.file_name,
        f.file_size,
        f.file_type,
        f.file_md5,
        f.is_directory,
        f.parent_path || null
      ]);
      
      const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flatValues = values.flat();
      
      await query(
        `INSERT INTO project_files 
         (project_id, file_path, file_name, file_size, file_type, file_md5, is_directory, parent_path) 
         VALUES ${placeholders}`,
        flatValues
      );
    }
    
    return NextResponse.json({
      success: true,
      filesCount: files.length,
      message: `Successfully scanned ${files.length} files`
    });
    
  } catch (error) {
    console.error('Error scanning project files:', error);
    return NextResponse.json(
      { error: 'Failed to scan project files' },
      { status: 500 }
    );
  }
}

// GET - 获取项目文件列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    const files = await query(
      `SELECT id, project_id, file_path, file_name, file_size, file_type, file_md5,
              is_directory, parent_path, created_at, updated_at
       FROM project_files 
       WHERE project_id = ?
       ORDER BY is_directory DESC, file_name ASC`,
      [projectId]
    );
    
    return NextResponse.json(files);
    
  } catch (error) {
    console.error('Error fetching project files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project files' },
      { status: 500 }
    );
  }
}
