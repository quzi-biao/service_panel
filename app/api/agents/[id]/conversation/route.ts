import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 获取或创建 Agent 的默认对话
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id);

    // 查找该 Agent 的对话
    const conversations = await query(
      'SELECT * FROM conversations WHERE agent_id = ? ORDER BY created_at DESC LIMIT 1',
      [agentId]
    );

    let conversation;

    if (Array.isArray(conversations) && conversations.length > 0) {
      // 已存在对话，直接返回
      conversation = conversations[0];
    } else {
      // 不存在对话，创建新的默认对话
      const result: any = await query(
        'INSERT INTO conversations (agent_id, title) VALUES (?, ?)',
        [agentId, '默认对话']
      );

      const newConversations = await query(
        'SELECT * FROM conversations WHERE id = ?',
        [result.insertId]
      );
      conversation = Array.isArray(newConversations) ? newConversations[0] : newConversations;
    }

    // 获取对话的所有消息
    const messages = await query(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversation.id]
    );

    return NextResponse.json({
      success: true,
      conversation,
      messages: messages || []
    });
  } catch (error: any) {
    console.error('Error getting/creating conversation:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
