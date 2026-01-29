import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, title } = body;

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id is required' },
        { status: 400 }
      );
    }

    const result: any = await query(
      'INSERT INTO conversations (agent_id, title) VALUES (?, ?)',
      [agent_id, title || '新对话']
    );

    const conversations = await query('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
    const conversation = Array.isArray(conversations) ? conversations[0] : conversations;

    return NextResponse.json({ success: true, conversation });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
