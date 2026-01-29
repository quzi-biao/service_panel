import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = parseInt(params.id);
    
    const messages = await query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
