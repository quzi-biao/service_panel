import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const tips = await query(
      'SELECT * FROM tips ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, tips });
  } catch (error) {
    console.error('Error fetching tips:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tips' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, tags } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO tips (content, tags) VALUES (?, ?)',
      [content.trim(), tags || null]
    );

    const newTip = await query(
      'SELECT * FROM tips WHERE id = ?',
      [(result as any).insertId]
    );

    return NextResponse.json({ 
      success: true, 
      tip: newTip[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tip' },
      { status: 500 }
    );
  }
}
