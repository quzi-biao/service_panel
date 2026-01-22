import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ProjectExtendedInput } from '@/types/project';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [projectRows] = await pool.query<RowDataPacket[]>(
      'SELECT extended_info FROM projects WHERE id = ?',
      [params.id]
    );

    if (projectRows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const [middleware] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM project_middleware WHERE project_id = ? ORDER BY created_at DESC',
      [params.id]
    );

    const [resources] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM project_resources WHERE project_id = ? ORDER BY created_at DESC',
      [params.id]
    );

    return NextResponse.json({
      extended_info: projectRows[0].extended_info,
      middleware,
      resources
    });
  } catch (error) {
    console.error('Error fetching extended info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch extended info' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const body: ProjectExtendedInput = await request.json();

    await connection.query<ResultSetHeader>(
      'UPDATE projects SET extended_info = ? WHERE id = ?',
      [body.extended_info || null, params.id]
    );

    await connection.query<ResultSetHeader>(
      'DELETE FROM project_middleware WHERE project_id = ?',
      [params.id]
    );

    if (body.middleware && body.middleware.length > 0) {
      for (const item of body.middleware) {
        await connection.query<ResultSetHeader>(
          'INSERT INTO project_middleware (project_id, middleware_name, middleware_config) VALUES (?, ?, ?)',
          [params.id, item.middleware_name, item.middleware_config || null]
        );
      }
    }

    await connection.query<ResultSetHeader>(
      'DELETE FROM project_resources WHERE project_id = ?',
      [params.id]
    );

    if (body.resources && body.resources.length > 0) {
      for (const item of body.resources) {
        await connection.query<ResultSetHeader>(
          'INSERT INTO project_resources (project_id, resource_name, resource_description) VALUES (?, ?, ?)',
          [params.id, item.resource_name, item.resource_description || null]
        );
      }
    }

    await connection.commit();

    const [middleware] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM project_middleware WHERE project_id = ? ORDER BY created_at DESC',
      [params.id]
    );

    const [resources] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM project_resources WHERE project_id = ? ORDER BY created_at DESC',
      [params.id]
    );

    const [projectRows] = await connection.query<RowDataPacket[]>(
      'SELECT extended_info FROM projects WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({
      extended_info: projectRows[0].extended_info,
      middleware,
      resources
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating extended info:', error);
    return NextResponse.json(
      { error: 'Failed to update extended info' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
