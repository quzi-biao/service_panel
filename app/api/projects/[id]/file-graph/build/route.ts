import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getNeo4jSession } from '@/lib/neo4j';
import { FileParserFactory } from '@/lib/file-parsers/FileParserFactory';
import { RowDataPacket } from 'mysql2';
import { findTargetFile, FileContent } from '@/lib/file-graph-utils';
import { FileRelation } from '@/lib/file-parsers/types';

type FileRelationWithId = FileRelation & { targetFileId: number };

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  let session;

  try {
    // 获取项目的所有文件
    const files = await query<RowDataPacket[]>(
      'SELECT id, file_path, file_name, is_directory FROM project_files WHERE project_id = ? AND is_directory = 0',
      [projectId]
    );

    if (files.length === 0) {
      return NextResponse.json({ success: true, message: '没有文件需要分析', nodesCount: 0, relationsCount: 0 });
    }

    // 获取文件内容
    const fileContents = await query<FileContent[]>(
      `SELECT pf.id, pf.file_path, pf.file_name, fc.content 
       FROM project_files pf 
       LEFT JOIN file_contents fc ON pf.id = fc.file_id 
       WHERE pf.project_id = ? AND pf.is_directory = 0`,
      [projectId]
    );

    // 初始化 Neo4j session
    session = await getNeo4jSession();

    // 清除该项目的旧数据
    await session.run(
      'MATCH (n:File {projectId: $projectId}) DETACH DELETE n',
      { projectId }
    );

    // 创建文件节点
    const parserFactory = new FileParserFactory();
    const fileMap = new Map<string, any>();

    for (const file of fileContents) {
      await session.run(
        `CREATE (f:File {
          id: $id,
          projectId: $projectId,
          filePath: $filePath,
          fileName: $fileName
        })`,
        {
          id: file.id.toString(),
          projectId,
          filePath: file.file_path,
          fileName: file.file_name,
        }
      );

      fileMap.set(file.file_path, file);
    }

    // 分析文件关系并创建边
    let relationsCount = 0;

    for (const file of fileContents) {
      if (!file.content) continue;

      const parser = parserFactory.getParser(file.file_path);
      if (!parser) continue;

      try {
        const parseResult = parser.parse(file.file_path, file.content);

        // 去重：使用 Map 存储唯一的关系
        const uniqueRelations = new Map<string, FileRelationWithId>();
        
        for (const relation of parseResult.relations) {
          const targetFile = findTargetFile(relation.targetFile, file.file_path, fileContents);
          
          if (targetFile) {
            // 使用 sourceId-targetId-relationType 作为唯一键
            const relationKey = `${file.id}-${targetFile.id}-${relation.relationType}`;
            
            // 如果已存在相同关系，保留第一个（或者可以选择保留行号最小的）
            if (!uniqueRelations.has(relationKey)) {
              uniqueRelations.set(relationKey, {
                ...relation,
                targetFileId: targetFile.id,
              });
            }
          }
        }

        // 创建去重后的关系
        for (const [, relation] of uniqueRelations) {
          await session.run(
            `MATCH (source:File {id: $sourceId, projectId: $projectId})
             MATCH (target:File {id: $targetId, projectId: $projectId})
             MERGE (source)-[r:${relation.relationType}]->(target)
             ON CREATE SET r.lineNumber = $lineNumber`,
            {
              sourceId: file.id.toString(),
              targetId: relation.targetFileId.toString(),
              projectId,
              lineNumber: relation.lineNumber || 0,
            }
          );
          relationsCount++;
        }
      } catch (error) {
        console.error(`Error parsing file ${file.file_path}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: '文件关系图谱构建完成',
      nodesCount: fileContents.length,
      relationsCount,
    });
  } catch (error) {
    console.error('Error building file graph:', error);
    return NextResponse.json(
      { error: 'Failed to build file graph', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.close();
    }
  }
}
