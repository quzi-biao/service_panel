import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Project, ProjectBasicInput } from '@/types/project';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects ORDER BY is_pinned DESC, created_at DESC'
    );
    const projects = (rows as any[]).map(row => ({
      ...row,
      is_pinned: Boolean(row.is_pinned),
      service_urls: row.service_urls ? JSON.parse(row.service_urls) : null
    }));
    return NextResponse.json(projects as Project[]);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ProjectBasicInput = await request.json();
    
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const serviceUrlsJson = body.service_urls ? JSON.stringify(body.service_urls) : null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO projects (name, description, project_url, dev_device_name, dev_device_path, deploy_server, service_urls) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.description || null,
        body.project_url || null,
        body.dev_device_name || null,
        body.dev_device_path || null,
        body.deploy_server || null,
        serviceUrlsJson
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM projects WHERE id = ?',
      [result.insertId]
    );

    const project = {
      ...rows[0],
      is_pinned: Boolean(rows[0].is_pinned),
      service_urls: rows[0].service_urls ? JSON.parse(rows[0].service_urls) : null
    };

    return NextResponse.json(project as Project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
