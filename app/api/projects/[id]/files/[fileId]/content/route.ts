import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// GET - 获取文件内容
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const fileId = parseInt(params.fileId);
    
    // 检查文件内容是否已缓存
    const cachedContent = await query(
      'SELECT content, encoding FROM file_contents WHERE file_id = ?',
      [fileId]
    ) as any[];
    
    if (cachedContent.length > 0) {
      return NextResponse.json({
        content: cachedContent[0].content,
        encoding: cachedContent[0].encoding,
        cached: true
      });
    }
    
    // 如果没有缓存，从文件系统读取
    const fileInfo = await query(
      `SELECT pf.*, p.dev_device_path 
       FROM project_files pf
       JOIN projects p ON pf.project_id = p.id
       WHERE pf.id = ? AND pf.project_id = ?`,
      [fileId, projectId]
    ) as any[];
    
    if (fileInfo.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    const file = fileInfo[0];
    
    if (file.is_directory) {
      return NextResponse.json(
        { error: 'Cannot read content of a directory' },
        { status: 400 }
      );
    }
    
    const fullPath = path.join(file.dev_device_path, file.file_path);
    
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      );
    }
    
    // 读取文件内容
    let content: string;
    let encoding = 'utf-8';
    
    try {
      // 检查文件大小，如果太大则不读取
      const stats = fs.statSync(fullPath);
      if (stats.size > 10 * 1024 * 1024) { // 10MB
        return NextResponse.json({
          error: 'File too large to display',
          size: stats.size
        }, { status: 413 });
      }
      
      // 尝试以 UTF-8 读取
      content = fs.readFileSync(fullPath, 'utf-8');
      
      // 缓存到数据库
      await query(
        `INSERT INTO file_contents (file_id, content, encoding) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE content = ?, encoding = ?, updated_at = CURRENT_TIMESTAMP`,
        [fileId, content, encoding, content, encoding]
      );
      
      return NextResponse.json({
        content,
        encoding,
        cached: false
      });
      
    } catch (err) {
      // 如果读取失败，可能是二进制文件
      return NextResponse.json({
        error: 'Cannot read file content (possibly binary file)',
        message: (err as Error).message
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file content' },
      { status: 500 }
    );
  }
}

// DELETE - 删除文件内容缓存
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const fileId = parseInt(params.fileId);
    
    await query('DELETE FROM file_contents WHERE file_id = ?', [fileId]);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting file content cache:', error);
    return NextResponse.json(
      { error: 'Failed to delete file content cache' },
      { status: 500 }
    );
  }
}
