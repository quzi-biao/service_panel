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
    const { files } = body; // files: Array<{ filePath: string, fileName: string, fileSize: number, fileType: string, isDirectory: boolean, parentPath: string, md5?: string }>

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 删除该项目的旧文件记录
    await query('DELETE FROM project_files WHERE project_id = ?', [projectId]);

    let insertedCount = 0;
    const errors: string[] = [];

    // 批量插入文件记录
    if (files.length > 0) {
      try {
        const values = files.map(f => [
          projectId,
          f.filePath,
          f.fileName,
          f.fileSize || 0,
          f.fileType || 'file',
          f.md5 || null,
          f.isDirectory ? 1 : 0,
          f.parentPath || null
        ]);

        const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = values.flat();

        await query(
          `INSERT INTO project_files 
           (project_id, file_path, file_name, file_size, file_type, file_md5, is_directory, parent_path) 
           VALUES ${placeholders}`,
          flatValues
        );

        insertedCount = files.length;
      } catch (error) {
        console.error('Error inserting files:', error);
        errors.push(`批量插入失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      filesCount: insertedCount,
      message: `成功扫描 ${insertedCount} 个文件`,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error scanning files:', error);
    return NextResponse.json(
      { error: 'Failed to scan files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
