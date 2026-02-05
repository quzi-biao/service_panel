import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const servers = await query('SELECT * FROM servers ORDER BY primary_tag, name');
    return NextResponse.json({ success: true, servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, host, port, username, password, private_key, auth_method, 
      primary_tag, tags, description, network_group,
      bastion_host, bastion_port, bastion_username, bastion_password, 
      bastion_private_key, bastion_auth_method 
    } = body;

    const result = await query(
      `INSERT INTO servers (
        name, host, port, username, password, private_key, auth_method, 
        primary_tag, tags, description, network_group,
        bastion_host, bastion_port, bastion_username, bastion_password, 
        bastion_private_key, bastion_auth_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, host, port || 22, username, password, private_key, auth_method || 'password', 
        primary_tag, tags, description, network_group,
        bastion_host, bastion_port || 22, bastion_username, bastion_password, 
        bastion_private_key, bastion_auth_method || 'password'
      ]
    );

    const newServer = await query('SELECT * FROM servers WHERE id = ?', [result.insertId]);
    
    return NextResponse.json({ 
      success: true, 
      server: newServer[0] 
    });
  } catch (error) {
    console.error('Error creating server:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create server' },
      { status: 500 }
    );
  }
}
