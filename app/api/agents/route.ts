import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const agents = await query('SELECT * FROM agents ORDER BY created_at DESC');
    return NextResponse.json({ success: true, agents });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      system_prompt,
      model,
      temperature,
      max_tokens,
      context_window,
      memory_enabled,
    } = body;

    if (!name || !system_prompt) {
      return NextResponse.json(
        { success: false, error: 'Name and system_prompt are required' },
        { status: 400 }
      );
    }

    const result: any = await query(
      `INSERT INTO agents (
        name, description, system_prompt, model, temperature, 
        max_tokens, context_window, memory_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        system_prompt,
        model || 'openai/gpt-3.5-turbo',
        temperature ?? 0.7,
        max_tokens ?? 2000,
        context_window ?? 4000,
        memory_enabled ? 1 : 0
      ]
    );

    const agents = await query('SELECT * FROM agents WHERE id = ?', [result.insertId]);
    const agent = Array.isArray(agents) ? agents[0] : agents;

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
