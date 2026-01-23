import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
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

    const file = files[0];
    let deletedCount = 0;

    if (file.is_directory) {
      // 如果是目录，删除该目录及其所有子文件
      // 查找所有以该目录路径开头的文件
      const childFiles = await query(
        `SELECT id FROM project_files 
         WHERE project_id = ? AND (file_path = ? OR file_path LIKE ?)`,
        [projectId, file.file_path, `${file.file_path}/%`]
      ) as any[];

      if (childFiles.length > 0) {
        const fileIds = childFiles.map(f => f.id);
        const placeholders = fileIds.map(() => '?').join(',');
        
        // 删除文件内容
        await query(
          `DELETE FROM file_contents WHERE file_id IN (${placeholders})`,
          fileIds
        );
        
        // 删除文件记录
        await query(
          `DELETE FROM project_files WHERE id IN (${placeholders})`,
          fileIds
        );
        
        deletedCount = childFiles.length;
      }
    } else {
      // 如果是文件，只删除该文件
      // 删除文件内容
      await query(
        'DELETE FROM file_contents WHERE file_id = ?',
        [fileId]
      );
      
      // 删除文件记录
      await query(
        'DELETE FROM project_files WHERE id = ?',
        [fileId]
      );
      
      deletedCount = 1;
    }

    return NextResponse.json({
      success: true,
      message: file.is_directory 
        ? `成功删除目录及其 ${deletedCount} 个文件/子目录`
        : '成功删除文件',
      deletedCount,
      isDirectory: file.is_directory,
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
