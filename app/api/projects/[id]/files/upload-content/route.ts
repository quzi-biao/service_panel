import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

function calculateMD5(content: string): string {
  const hashSum = crypto.createHash('md5');
  hashSum.update(content);
  return hashSum.digest('hex');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    const body = await request.json();
    const { files } = body; // files: Array<{ fileId: number, content: string, filePath: string }>

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;
    const errors: string[] = [];

    for (const fileData of files) {
      try {
        const { fileId, content, filePath } = fileData;

        if (!fileId || content === undefined) {
          errors.push(`${filePath || 'Unknown'}: Missing fileId or content`);
          continue;
        }

        // 验证文件是否属于该项目
        const fileRecords = await query(
          'SELECT * FROM project_files WHERE id = ? AND project_id = ?',
          [fileId, projectId]
        ) as any[];

        if (fileRecords.length === 0) {
          errors.push(`${filePath}: File not found in project`);
          continue;
        }

        const fileRecord = fileRecords[0];
        const contentMD5 = calculateMD5(content);
        const contentSize = Buffer.byteLength(content, 'utf-8');

        // 检查是否已存在文件内容记录
        const existingContent = await query(
          'SELECT id FROM file_contents WHERE file_id = ?',
          [fileId]
        ) as any[];

        if (existingContent.length > 0) {
          // 更新现有记录
          await query(
            `UPDATE file_contents 
             SET content = ?, updated_at = NOW()
             WHERE file_id = ?`,
            [content, fileId]
          );
          updatedCount++;
        } else {
          // 插入新记录
          await query(
            `INSERT INTO file_contents (file_id, content)
             VALUES (?, ?)`,
            [fileId, content]
          );
          createdCount++;
        }

        // 更新 project_files 表中的 MD5 和大小
        await query(
          `UPDATE project_files 
           SET file_size = ?, file_md5 = ?, updated_at = NOW()
           WHERE id = ?`,
          [contentSize, contentMD5, fileId]
        );

        syncedCount++;
      } catch (error) {
        console.error(`Error syncing file ${fileData.filePath}:`, error);
        errors.push(`${fileData.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `同步完成`,
      syncedCount,
      updatedCount,
      createdCount,
      totalFiles: files.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error uploading file contents:', error);
    return NextResponse.json(
      { error: 'Failed to upload file contents', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
