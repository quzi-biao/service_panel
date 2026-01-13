import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ServiceInput } from '@/types/service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services WHERE id = ?',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ServiceInput = await request.json();

    if (!body.name || !body.url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE services SET name = ?, url = ?, username = ?, password = ?, description = ? WHERE id = ?',
      [body.name, body.url, body.username || null, body.password || null, body.description || null, params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services WHERE id = ?',
      [params.id]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
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
      // First get current state
      const [currentRows] = await pool.query<RowDataPacket[]>(
        'SELECT is_pinned FROM services WHERE id = ?',
        [params.id]
      );

      if (currentRows.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      // Toggle the value
      const newPinnedValue = currentRows[0].is_pinned ? 0 : 1;
      
      await pool.query<ResultSetHeader>(
        'UPDATE services SET is_pinned = ? WHERE id = ?',
        [newPinnedValue, params.id]
      );

      // Get updated service
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM services WHERE id = ?',
        [params.id]
      );

      const service = {
        ...rows[0],
        is_pinned: Boolean(rows[0].is_pinned)
      };

      return NextResponse.json(service);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error patching service:', error);
    return NextResponse.json(
      { error: 'Failed to patch service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM services WHERE id = ?',
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}
