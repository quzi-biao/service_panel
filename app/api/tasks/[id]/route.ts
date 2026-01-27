import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { task_name, task_description, project_id, project_name, status, completed_time } = body;
    const taskId = params.id;

    const updates: string[] = [];
    const values: any[] = [];

    if (task_name !== undefined) {
      updates.push('task_name = ?');
      values.push(task_name);
    }
    if (task_description !== undefined) {
      updates.push('task_description = ?');
      values.push(task_description);
    }
    if (project_id !== undefined) {
      updates.push('project_id = ?');
      values.push(project_id);
    }
    if (project_name !== undefined) {
      updates.push('project_name = ?');
      values.push(project_name);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      // 状态为已完成时，自动设置完成时间
      if (status === 'completed' && !completed_time) {
        updates.push('completed_time = NOW()');
      } 
      // 状态为进行中时，清除完成时间
      else if (status === 'in_progress') {
        updates.push('completed_time = NULL');
      }
    }
    if (completed_time !== undefined) {
      updates.push('completed_time = ?');
      // Convert ISO string to MySQL datetime format or null
      if (completed_time === null) {
        values.push(null);
      } else {
        // Convert ISO 8601 to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
        const date = new Date(completed_time);
        const mysqlDatetime = date.toISOString().slice(0, 19).replace('T', ' ');
        values.push(mysqlDatetime);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(taskId);
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    
    await query(sql, values);

    // Fetch and return the updated task
    const updatedTask = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    
    return NextResponse.json({ 
      success: true, 
      task: updatedTask[0] 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    await query('DELETE FROM tasks WHERE id = ?', [taskId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
