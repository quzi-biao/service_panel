import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import fs from 'fs';
import path from 'path';
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

    // 获取数据库中的所有文件记录
    const dbFiles = await query(
      'SELECT * FROM project_files WHERE project_id = ? AND is_directory = 0',
      [projectId]
    ) as any[];

    let syncedCount = 0;
    let updatedFromDisk = 0;
    let updatedFromDb = 0;
    let errors: string[] = [];

    for (const dbFile of dbFiles) {
      try {
        const fullFilePath = path.join(projectPath, dbFile.file_path);

        // 检查文件是否存在
        if (!fs.existsSync(fullFilePath)) {
          errors.push(`文件不存在: ${dbFile.file_path}`);
          continue;
        }

        // 获取文件的磁盘信息
        const stats = fs.statSync(fullFilePath);
        const diskMtime = new Date(stats.mtime);
        const diskMD5 = calculateMD5(fullFilePath);

        // 获取数据库中的文件内容记录
        const contentRecords = await query(
          'SELECT * FROM file_contents WHERE file_id = ?',
          [dbFile.id]
        ) as any[];

        const dbMtime = new Date(dbFile.updated_at);

        // 比较更新时间，决定同步方向
        if (contentRecords.length === 0) {
          // 数据库中没有内容记录，从磁盘同步到数据库
          const fileContent = fs.readFileSync(fullFilePath, 'utf-8');
          await query(
            `INSERT INTO file_contents (file_id, content)
             VALUES (?, ?)`,
            [dbFile.id, fileContent]
          );

          await query(
            `UPDATE project_files 
             SET file_size = ?, file_md5 = ?, updated_at = NOW()
             WHERE id = ?`,
            [stats.size, diskMD5, dbFile.id]
          );

          updatedFromDisk++;
          syncedCount++;
        } else {
          const contentRecord = contentRecords[0];
          const contentMtime = new Date(contentRecord.updated_at);

          // 比较 MD5 判断文件是否有变化
          if (diskMD5 !== dbFile.file_md5) {
            // 文件有变化，根据时间戳决定同步方向
            if (diskMtime > contentMtime) {
              // 磁盘文件更新，同步到数据库
              const fileContent = fs.readFileSync(fullFilePath, 'utf-8');
              await query(
                `UPDATE file_contents 
                 SET content = ?, updated_at = NOW()
                 WHERE file_id = ?`,
                [fileContent, dbFile.id]
              );

              await query(
                `UPDATE project_files 
                 SET file_size = ?, file_md5 = ?, updated_at = NOW()
                 WHERE id = ?`,
                [stats.size, diskMD5, dbFile.id]
              );

              updatedFromDisk++;
              syncedCount++;
            } else if (contentMtime > diskMtime) {
              // 数据库内容更新，同步到磁盘
              fs.writeFileSync(fullFilePath, contentRecord.content, 'utf-8');
              
              // 更新文件的修改时间为数据库的时间
              fs.utimesSync(fullFilePath, contentMtime, contentMtime);

              await query(
                `UPDATE project_files 
                 SET file_size = ?, file_md5 = ?, updated_at = NOW()
                 WHERE id = ?`,
                [stats.size, diskMD5, dbFile.id]
              );

              updatedFromDb++;
              syncedCount++;
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing file ${dbFile.file_path}:`, error);
        errors.push(`${dbFile.file_path}: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `同步完成`,
      syncedCount,
      updatedFromDisk,
      updatedFromDb,
      totalFiles: dbFiles.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error syncing files:', error);
    return NextResponse.json(
      { error: 'Failed to sync files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
