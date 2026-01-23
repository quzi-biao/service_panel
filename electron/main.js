const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

let mainWindow;
let nextServerProcess = null;
let isQuitting = false;

// 确保只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running. Quitting...');
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('Second instance detected, focusing existing window');
    // 当运行第二个实例时，聚焦到已有窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  console.log('Creating window...');
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: '服务面板',
    icon: path.join(__dirname, '../public/icon.png')
  });

  // 开发环境加载 localhost，生产环境加载打包后的文件
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3004');
    // 开发环境打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境需要先启动 Next.js 服务器
    const { spawn } = require('child_process');
    const fs = require('fs');
    
    // 获取正确的资源路径
    const appPath = app.getAppPath();
    const resourcesPath = process.resourcesPath;
    
    console.log('=== Production Mode ===');
    console.log('App path:', appPath);
    console.log('Resources path:', resourcesPath);
    console.log('App is packaged:', app.isPackaged);
    
    // 查找 node 可执行文件
    let nodePath = 'node';
    const possibleNodePaths = [
      '/usr/local/bin/node',
      '/opt/homebrew/bin/node',
      '/usr/bin/node'
    ];
    
    for (const p of possibleNodePaths) {
      if (fs.existsSync(p)) {
        nodePath = p;
        console.log('Found node at:', nodePath);
        break;
      }
    }
    
    // 查找 Next.js 启动脚本
    const nextBinPath = path.join(appPath, 'node_modules', 'next', 'dist', 'bin', 'next');
    console.log('Next.js bin path:', nextBinPath);
    console.log('Next.js bin exists:', fs.existsSync(nextBinPath));
    
    // 检查 .next 目录
    const nextBuildPath = path.join(appPath, '.next');
    console.log('.next build path:', nextBuildPath);
    console.log('.next exists:', fs.existsSync(nextBuildPath));
    
    if (!fs.existsSync(nextBinPath)) {
      console.error('Next.js binary not found!');
      mainWindow.loadURL(`data:text/html,<h1>Error</h1><p>Next.js not found at: ${nextBinPath}</p>`);
      return;
    }
    
    if (!fs.existsSync(nextBuildPath)) {
      console.error('Next.js build not found!');
      mainWindow.loadURL(`data:text/html,<h1>Error</h1><p>.next build not found at: ${nextBuildPath}</p>`);
      return;
    }
    
    console.log('Starting Next.js server...');
    
    nextServerProcess = spawn(nodePath, [
      nextBinPath,
      'start',
      '-p',
      '3004'
    ], {
      cwd: appPath,
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        PORT: '3004'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    nextServerProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Next.js] ${output}`);
    });
    
    nextServerProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(`[Next.js Error] ${output}`);
    });
    
    nextServerProcess.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      mainWindow.loadURL(`data:text/html,<h1>Server Error</h1><p>${error.message}</p>`);
    });
    
    nextServerProcess.on('exit', (code, signal) => {
      console.log(`Next.js server exited with code ${code}, signal ${signal}`);
      if (code !== 0 && code !== null) {
        console.error('Next.js server crashed!');
      }
    });

    // 等待服务器启动后加载
    let attempts = 0;
    const maxAttempts = 30;
    const checkServer = setInterval(() => {
      attempts++;
      console.log(`Checking server... attempt ${attempts}/${maxAttempts}`);
      
      require('http').get('http://localhost:3004', (res) => {
        console.log(`Server responded with status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          clearInterval(checkServer);
          console.log('Next.js server is ready!');
          mainWindow.loadURL('http://localhost:3004');
        }
      }).on('error', (err) => {
        console.log(`Server check failed: ${err.message}`);
        if (attempts >= maxAttempts) {
          clearInterval(checkServer);
          console.error('Failed to connect to Next.js server after 30 attempts');
          mainWindow.loadURL(`data:text/html,<h1>Failed to start server</h1><p>Check console for errors</p><p>Attempts: ${attempts}</p>`);
        }
      });
    }, 1000);
  }

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });
  
  mainWindow.on('close', (e) => {
    console.log('Window closing...');
    if (!isQuitting) {
      isQuitting = true;
    }
  });
}

// 处理打开终端的 IPC 请求
ipcMain.handle('open-terminal', async (event, dirPath) => {
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let command;

    switch (platform) {
      case 'darwin': // macOS
        command = `open -a Terminal "${dirPath}"`;
        break;
      case 'win32': // Windows
        command = `start cmd /K "cd /d ${dirPath}"`;
        break;
      case 'linux': // Linux
        // 尝试常见的终端模拟器
        command = `gnome-terminal --working-directory="${dirPath}" || xterm -e "cd ${dirPath} && bash" || konsole --workdir "${dirPath}"`;
        break;
      default:
        reject(new Error('Unsupported platform'));
        return;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error opening terminal:', error);
        reject(error);
        return;
      }
      resolve({ success: true });
    });
  });
});

// 获取平台信息
ipcMain.handle('get-platform', () => {
  return {
    platform: os.platform(),
    arch: os.arch(),
    version: os.release()
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  console.log('All windows closed');
  isQuitting = true;
  
  // 清理 Next.js 服务器进程
  if (nextServerProcess) {
    console.log('Killing Next.js server process...');
    try {
      nextServerProcess.kill('SIGTERM');
      nextServerProcess = null;
    } catch (err) {
      console.error('Error killing Next.js process:', err);
    }
  }
  
  // 所有平台都退出应用（包括 macOS）
  console.log('Quitting app...');
  app.quit();
});

app.on('activate', () => {
  console.log('App activated');
  // macOS 上点击 dock 图标时重新创建窗口
  // 但只在没有退出标志且没有窗口时创建
  if (!isQuitting && BrowserWindow.getAllWindows().length === 0) {
    console.log('Creating new window on activate');
    createWindow();
  } else {
    console.log('Skipping window creation (isQuitting or windows exist)');
  }
});

app.on('before-quit', (e) => {
  console.log('Before quit event');
  isQuitting = true;
  
  // 应用退出前清理
  if (nextServerProcess) {
    console.log('Cleaning up Next.js server before quit...');
    try {
      nextServerProcess.kill('SIGTERM');
      nextServerProcess = null;
    } catch (err) {
      console.error('Error killing Next.js process:', err);
    }
  }
});
