import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import crypto from 'crypto';

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const fileId = parseInt(params.fileId);

    // 获取文件信息
    const files = await query(
      'SELECT * FROM project_files WHERE id = ? AND project_id = ?',
      [fileId, projectId]
    ) as any[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileRecord = files[0];

    // 获取项目路径
    const projects = await query(
      'SELECT dev_device_path FROM projects WHERE id = ?',
      [projectId]
    ) as any[];

    if (projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const projectPath = projects[0].dev_device_path;
    const fullFilePath = `${projectPath}/${fileRecord.file_path}`;

    // 检查文件是否存在
    if (!fs.existsSync(fullFilePath)) {
      return NextResponse.json(
        { error: 'File does not exist on disk' },
        { status: 404 }
      );
    }

    // 读取文件内容
    const fileContent = fs.readFileSync(fullFilePath, 'utf-8');
    const stats = fs.statSync(fullFilePath);
    const newMD5 = calculateMD5(fullFilePath);

    // 检查是否已存在文件内容记录
    const existingContent = await query(
      'SELECT id FROM project_file_contents WHERE file_id = ?',
      [fileId]
    ) as any[];

    if (existingContent.length > 0) {
      // 更新现有记录
      await query(
        `UPDATE project_file_contents 
         SET content = ?, file_size = ?, file_md5 = ?, updated_at = NOW()
         WHERE file_id = ?`,
        [fileContent, stats.size, newMD5, fileId]
      );

      // 同时更新 project_files 表中的 MD5 和大小
      await query(
        `UPDATE project_files 
         SET file_size = ?, file_md5 = ?, updated_at = NOW()
         WHERE id = ?`,
        [stats.size, newMD5, fileId]
      );

      return NextResponse.json({
        success: true,
        message: 'File content updated successfully',
        updated: true,
      });
    } else {
      // 插入新记录
      await query(
        `INSERT INTO project_file_contents (file_id, content, file_size, file_md5)
         VALUES (?, ?, ?, ?)`,
        [fileId, fileContent, stats.size, newMD5]
      );

      // 同时更新 project_files 表中的 MD5 和大小
      await query(
        `UPDATE project_files 
         SET file_size = ?, file_md5 = ?, updated_at = NOW()
         WHERE id = ?`,
        [stats.size, newMD5, fileId]
      );

      return NextResponse.json({
        success: true,
        message: 'File content synced successfully',
        updated: false,
      });
    }
  } catch (error) {
    console.error('Error syncing file:', error);
    return NextResponse.json(
      { error: 'Failed to sync file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
