import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      name, host, port, username, password, private_key, auth_method, 
      primary_tag, tags, description, network_group,
      bastion_host, bastion_port, bastion_username, bastion_password, 
      bastion_private_key, bastion_auth_method 
    } = body;
    const serverId = params.id;

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (host !== undefined) {
      updates.push('host = ?');
      values.push(host);
    }
    if (port !== undefined) {
      updates.push('port = ?');
      values.push(port);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (password !== undefined) {
      updates.push('password = ?');
      values.push(password);
    }
    if (private_key !== undefined) {
      updates.push('private_key = ?');
      values.push(private_key);
    }
    if (auth_method !== undefined) {
      updates.push('auth_method = ?');
      values.push(auth_method);
    }
    if (primary_tag !== undefined) {
      updates.push('primary_tag = ?');
      values.push(primary_tag);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(tags);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (network_group !== undefined) {
      updates.push('network_group = ?');
      values.push(network_group);
    }
    if (bastion_host !== undefined) {
      updates.push('bastion_host = ?');
      values.push(bastion_host);
    }
    if (bastion_port !== undefined) {
      updates.push('bastion_port = ?');
      values.push(bastion_port);
    }
    if (bastion_username !== undefined) {
      updates.push('bastion_username = ?');
      values.push(bastion_username);
    }
    if (bastion_password !== undefined) {
      updates.push('bastion_password = ?');
      values.push(bastion_password);
    }
    if (bastion_private_key !== undefined) {
      updates.push('bastion_private_key = ?');
      values.push(bastion_private_key);
    }
    if (bastion_auth_method !== undefined) {
      updates.push('bastion_auth_method = ?');
      values.push(bastion_auth_method);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(serverId);
    const sql = `UPDATE servers SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);

    const updatedServer = await query('SELECT * FROM servers WHERE id = ?', [serverId]);
    
    return NextResponse.json({ 
      success: true, 
      server: updatedServer[0] 
    });
  } catch (error) {
    console.error('Error updating server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update server' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serverId = params.id;
    await query('DELETE FROM servers WHERE id = ?', [serverId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}
