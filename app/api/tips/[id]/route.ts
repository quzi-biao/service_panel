import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { content, tags } = body;
    const tipId = params.id;

    const updates: string[] = [];
    const values: any[] = [];

    if (content !== undefined) {
      if (!content.trim()) {
        return NextResponse.json(
          { success: false, error: 'Content cannot be empty' },
          { status: 400 }
        );
      }
      updates.push('content = ?');
      values.push(content.trim());
    }

    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(tags || null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(tipId);
    const sql = `UPDATE tips SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);

    const updatedTip = await query('SELECT * FROM tips WHERE id = ?', [tipId]);
    
    return NextResponse.json({ 
      success: true, 
      tip: updatedTip[0] 
    });
  } catch (error) {
    console.error('Error updating tip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tipId = params.id;
    await query('DELETE FROM tips WHERE id = ?', [tipId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tip:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete tip' },
      { status: 500 }
    );
  }
}
