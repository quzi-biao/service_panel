import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      );
    }

    // Detect OS and open terminal accordingly
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      // macOS - open Terminal.app with the directory
      command = `open -a Terminal "${path}"`;
    } else if (platform === 'win32') {
      // Windows - open Command Prompt
      command = `start cmd /K "cd /d ${path}"`;
    } else {
      // Linux - try common terminal emulators
      command = `x-terminal-emulator -e "cd ${path} && bash" || gnome-terminal --working-directory="${path}" || xterm -e "cd ${path} && bash"`;
    }

    await execAsync(command);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error opening terminal:', error);
    return NextResponse.json(
      { error: 'Failed to open terminal' },
      { status: 500 }
    );
  }
}
