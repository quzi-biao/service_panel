import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import * as XLSX from 'xlsx';

function parseExcelDate(dateValue: any): string | null {
  if (!dateValue) return null;
  
  try {
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return dateValue.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    // If it's a string like "2026/1/12" or "2026-1-12"
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      }
    }
    
    // If it's an Excel serial number
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const row of data as any[]) {
      try {
        const task_name = row['描述'] || row['task_name'];
        const task_description = row['工作记录'] || row['task_description'] || null;
        const project_id = row['项目ID'] || row['project_id'] || null;
        const project_name = row['项目名称'] || row['project_name'] || null;
        const status = row['状态'] || row['status'] || 'not_started';
        const proposed_time = parseExcelDate(row['提出时间'] || row['proposed_time']);
        const completed_time = parseExcelDate(row['完成时间'] || row['completed_time']);

        const statusMap: { [key: string]: string } = {
          '未开始': 'not_started',
          '进行中': 'in_progress',
          '已完成': 'completed',
          '已放弃': 'abandoned',
          'not_started': 'not_started',
          'in_progress': 'in_progress',
          'done': 'completed',
          'abandoned': 'abandoned',
        };

        const mappedStatus = statusMap[status] || 'not_started';

        await query(
          `INSERT INTO tasks (task_name, task_description, project_id, project_name, status, proposed_time, completed_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [task_name, task_description, project_id, project_name, mappedStatus, proposed_time, completed_time]
        );

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Error importing row: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Error importing tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import tasks' },
      { status: 500 }
    );
  }
}
