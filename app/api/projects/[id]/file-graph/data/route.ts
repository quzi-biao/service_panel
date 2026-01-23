import { NextRequest, NextResponse } from 'next/server';
import { getNeo4jSession } from '@/lib/neo4j';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  let session;

  try {
    session = await getNeo4jSession();

    // 获取所有节点
    const nodesResult = await session.run(
      'MATCH (n:File {projectId: $projectId}) RETURN n',
      { projectId }
    );

    // 获取所有关系
    const relationsResult = await session.run(
      `MATCH (source:File {projectId: $projectId})-[r]->(target:File {projectId: $projectId})
       RETURN source, r, target, type(r) as relationType`,
      { projectId }
    );

    // 转换节点数据
    const nodes = nodesResult.records.map(record => {
      const node = record.get('n');
      return {
        id: node.properties.id,
        label: node.properties.fileName,
        filePath: node.properties.filePath,
      };
    });

    // 转换关系数据
    const links = relationsResult.records.map(record => {
      const source = record.get('source');
      const target = record.get('target');
      const relationType = record.get('relationType');
      const relation = record.get('r');

      return {
        from: source.properties.id,
        to: target.properties.id,
        type: relationType,
        lineNumber: relation.properties.lineNumber,
      };
    });

    return NextResponse.json({
      success: true,
      nodes,
      links,
    });
  } catch (error) {
    console.error('Error fetching file graph data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file graph data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.close();
    }
  }
}
