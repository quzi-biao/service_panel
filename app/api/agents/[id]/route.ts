import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id);
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

    await query(
      `UPDATE agents SET 
        name = ?, 
        description = ?, 
        system_prompt = ?, 
        model = ?, 
        temperature = ?, 
        max_tokens = ?, 
        context_window = ?, 
        memory_enabled = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        description || null,
        system_prompt,
        model,
        temperature,
        max_tokens,
        context_window,
        memory_enabled,
        agentId
      ]
    );

    const agents = await query('SELECT * FROM agents WHERE id = ?', [agentId]);
    const agent = Array.isArray(agents) ? agents[0] : agents;

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id);

    await query('DELETE FROM agents WHERE id = ?', [agentId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
