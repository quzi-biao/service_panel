import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, sort_order, created_at, updated_at FROM project_types ORDER BY sort_order, name'
    );
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching project types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Get max sort_order
    const [maxOrder] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM project_types'
    );
    const sortOrder = maxOrder[0].max_order + 1;

    // Insert new type (id will be auto-generated)
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO project_types (name, sort_order) VALUES (?, ?)',
      [name, sortOrder]
    );

    const [newType] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, sort_order, created_at, updated_at FROM project_types WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newType[0], { status: 201 });
  } catch (error) {
    console.error('Error creating project type:', error);
    return NextResponse.json(
      { error: 'Failed to create project type' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, sortOrders } = body;
    
    // Handle batch sort order update
    if (sortOrders && Array.isArray(sortOrders)) {
      for (const item of sortOrders) {
        await pool.query(
          'UPDATE project_types SET sort_order = ? WHERE id = ?',
          [item.sort_order, item.id]
        );
      }
      return NextResponse.json({ success: true });
    }
    
    // Handle single type update
    if (!id || !name) {
      return NextResponse.json(
        { error: 'ID and name are required' },
        { status: 400 }
      );
    }

    // Update type name
    await pool.query(
      'UPDATE project_types SET name = ? WHERE id = ?',
      [name, id]
    );

    // Update all projects using this type
    await pool.query(
      'UPDATE projects SET project_type = ? WHERE project_type = ?',
      [id, id]
    );

    const [updated] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, sort_order, created_at, updated_at FROM project_types WHERE id = ?',
      [id]
    );

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating project type:', error);
    return NextResponse.json(
      { error: 'Failed to update project type' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    
    if (!idParam) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Check if any projects use this type
    const [projects] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM projects WHERE project_type = ?',
      [id]
    );

    if (projects[0].count > 0) {
      return NextResponse.json(
        { error: `Cannot delete type: ${projects[0].count} project(s) are using this type` },
        { status: 400 }
      );
    }

    // Delete the type
    await pool.query(
      'DELETE FROM project_types WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project type:', error);
    return NextResponse.json(
      { error: 'Failed to delete project type' },
      { status: 500 }
    );
  }
}
