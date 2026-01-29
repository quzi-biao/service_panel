import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AIService } from '@/lib/ai';
import { MemoryManager } from '@/lib/ai/memory';
import { Message } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, conversation_id, message } = body;

    if (!agent_id || !conversation_id || !message) {
      return NextResponse.json(
        { success: false, error: 'agent_id, conversation_id, and message are required' },
        { status: 400 }
      );
    }

    // 获取 Agent 配置
    const agents = await query('SELECT * FROM agents WHERE id = ?', [agent_id]);
    const agentRaw = Array.isArray(agents) ? agents[0] : agents;
    
    if (!agentRaw) {
      return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 });
    }

    // 确保数值字段是数字类型（MySQL 可能返回字符串）
    const agent = {
      ...agentRaw,
      temperature: parseFloat(agentRaw.temperature),
      max_tokens: parseInt(agentRaw.max_tokens),
      context_window: parseInt(agentRaw.context_window),
      memory_enabled: Boolean(agentRaw.memory_enabled),
    };

    // 保存用户消息
    await query(
      'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
      [conversation_id, 'user', message]
    );

    // 获取对话历史
    const historyMessages = await query(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversation_id]
    ) as Message[];

    // 构建上下文（使用 Memory Manager）
    const contextMessages = MemoryManager.buildContext(
      agent.system_prompt,
      historyMessages,
      agent.context_window
    );

    // 调用 AI 服务
    const aiService = AIService.getInstance();
    const provider = aiService.getProvider();

    const response = await provider.chat({
      model: agent.model,
      messages: contextMessages,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
    });

    const assistantContent = response.choices[0]?.message?.content || '抱歉，我无法生成回复。';
    const tokens = response.usage?.total_tokens || 0;

    // 保存助手消息
    const result: any = await query(
      'INSERT INTO messages (conversation_id, role, content, tokens) VALUES (?, ?, ?, ?)',
      [conversation_id, 'assistant', assistantContent, tokens]
    );

    const messages = await query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    const assistantMessage = Array.isArray(messages) ? messages[0] : messages;

    // 更新对话的 updated_at
    await query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [conversation_id]);

    return NextResponse.json({ success: true, message: assistantMessage });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
