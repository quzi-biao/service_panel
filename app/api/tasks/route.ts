import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Task {
  id: number;
  task_name: string | null;
  task_description: string | null;
  proposed_time: string;
  completed_time: string | null;
  project_id: number | null;
  project_name: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const tasks = await query<Task[]>(
      `SELECT * FROM tasks 
       ORDER BY 
         CASE status 
           WHEN 'not_started' THEN 1 
           WHEN 'in_progress' THEN 2 
           WHEN 'completed' THEN 3 
           WHEN 'abandoned' THEN 4 
         END,
         proposed_time DESC`
    );

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_name, task_description, project_id, project_name, status } = body;

    const result = await query(
      `INSERT INTO tasks (task_name, task_description, project_id, project_name, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [task_name || null, task_description || null, project_id || null, project_name || null, status || 'not_started']
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
