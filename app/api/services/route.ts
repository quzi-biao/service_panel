import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Service, ServiceInput } from '@/types/service';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services ORDER BY is_pinned DESC, created_at DESC'
    );
    const services = (rows as any[]).map(row => ({
      ...row,
      is_pinned: Boolean(row.is_pinned)
    }));
    return NextResponse.json(services as Service[]);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ServiceInput = await request.json();
    
    if (!body.name || !body.url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO services (name, url, username, password, description) VALUES (?, ?, ?, ?, ?)',
      [body.name, body.url, body.username || null, body.password || null, body.description || null]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM services WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(rows[0] as Service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
