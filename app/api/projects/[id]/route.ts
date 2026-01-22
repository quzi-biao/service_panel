import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Project, ProjectBasicInput } from '@/types/project';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects WHERE id = ?',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch middleware
    const [middlewareRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM project_middleware WHERE project_id = ? ORDER BY created_at',
      [params.id]
    );

    // Fetch resources
    const [resourceRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM project_resources WHERE project_id = ? ORDER BY created_at',
      [params.id]
    );

    const project = {
      ...rows[0],
      is_pinned: Boolean(rows[0].is_pinned),
      service_urls: rows[0].service_urls ? JSON.parse(rows[0].service_urls) : null,
      extended_info: {
        middleware: middlewareRows,
        resources: resourceRows
      }
    };

    return NextResponse.json(project as Project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ProjectBasicInput = await request.json();

    if (!body.name || !body.project_type) {
      return NextResponse.json(
        { error: 'Name and project type are required' },
        { status: 400 }
      );
    }

    const serviceUrlsJson = body.service_urls ? JSON.stringify(body.service_urls) : null;

    await pool.query<ResultSetHeader>(
      `UPDATE projects 
       SET name = ?, project_type = ?, description = ?, project_url = ?, dev_device_name = ?, 
           dev_device_path = ?, deploy_server = ?, service_urls = ?
       WHERE id = ?`,
      [
        body.name,
        body.project_type,
        body.description || null,
        body.project_url || null,
        body.dev_device_name || null,
        body.dev_device_path || null,
        body.deploy_server || null,
        serviceUrlsJson,
        params.id
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects WHERE id = ?',
      [params.id]
    );

    const project = {
      ...rows[0],
      is_pinned: Boolean(rows[0].is_pinned),
      service_urls: rows[0].service_urls ? JSON.parse(rows[0].service_urls) : null
    };

    return NextResponse.json(project as Project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pool.query<ResultSetHeader>(
      'DELETE FROM projects WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (body.action === 'toggle-pin') {
      const [currentRows] = await pool.query<RowDataPacket[]>(
        'SELECT is_pinned FROM projects WHERE id = ?',
        [params.id]
      );

      if (currentRows.length === 0) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const newPinnedValue = currentRows[0].is_pinned ? 0 : 1;
      
      await pool.query<ResultSetHeader>(
        'UPDATE projects SET is_pinned = ? WHERE id = ?',
        [newPinnedValue, params.id]
      );

      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM projects WHERE id = ?',
        [params.id]
      );

      const project = {
        ...rows[0],
        is_pinned: Boolean(rows[0].is_pinned),
        service_urls: rows[0].service_urls ? JSON.parse(rows[0].service_urls) : null
      };

      return NextResponse.json(project);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error patching project:', error);
    return NextResponse.json(
      { error: 'Failed to patch project' },
      { status: 500 }
    );
  }
}
