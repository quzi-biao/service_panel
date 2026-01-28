const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function afterPack(context) {
  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
    'Contents',
    'Resources',
    'app'
  );

  console.log('=== After Pack Hook ===');
  console.log('Reinstalling dependencies with npm in:', appPath);

  try {
    // 检查 package.json 是否存在
    const packageJsonPath = path.join(appPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error('package.json not found at:', packageJsonPath);
      return;
    }

    // 删除 pnpm 的 node_modules（包含符号链接）
    const nodeModulesPath = path.join(appPath, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      console.log('Removing pnpm node_modules...');
      execSync(`rm -rf "${nodeModulesPath}"`, { cwd: appPath });
    }

    // 使用 npm install 安装生产依赖
    console.log('Installing dependencies with npm install...');
    execSync('npm install --production --legacy-peer-deps --no-audit --no-fund', {
      cwd: appPath,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    console.log('Dependencies installed successfully with npm!');

    // 验证关键依赖
    const criticalDeps = ['next', 'react', 'react-dom', 'styled-jsx', 'ssh2', 'socket.io', 'socket.io-client'];
    for (const dep of criticalDeps) {
      const depPath = path.join(appPath, 'node_modules', dep);
      if (fs.existsSync(depPath)) {
        console.log(`✓ ${dep} installed`);
      } else {
        console.warn(`✗ ${dep} NOT found!`);
      }
    }
    
    // 验证 server.js 和 server 目录
    const serverJsPath = path.join(appPath, 'server.js');
    const serverDirPath = path.join(appPath, 'server');
    console.log(`✓ server.js exists: ${fs.existsSync(serverJsPath)}`);
    console.log(`✓ server/ directory exists: ${fs.existsSync(serverDirPath)}`);

  } catch (error) {
    console.error('Failed to install dependencies:', error);
    throw error;
  }
};
