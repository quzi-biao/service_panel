# Electron 桌面应用

本项目已集成 Electron，可以打包成桌面应用，支持直接从浏览器打开本地终端。

## 功能特性

- ✅ 跨平台桌面应用（macOS、Windows、Linux）
- ✅ 直接打开本地终端到指定目录
- ✅ 完整的 Next.js Web 功能
- ✅ 原生窗口体验

## 开发环境运行

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动 Electron 开发模式

```bash
pnpm run electron:dev
```

这会同时启动：
- Next.js 开发服务器（端口 3004）
- Electron 窗口

## 生产环境打包

### 打包所有平台

```bash
pnpm run electron:build
```

### 仅打包当前平台

```bash
# macOS
pnpm run electron:build -- --mac

# Windows
pnpm run electron:build -- --win

# Linux
pnpm run electron:build -- --linux
```

打包后的文件在 `dist/` 目录下。

## 项目结构

```
dev_panel/
├── electron/
│   ├── main.js          # Electron 主进程
│   ├── preload.js       # 预加载脚本（IPC 桥接）
│   └── types.d.ts       # TypeScript 类型定义
├── app/                 # Next.js 应用
├── components/          # React 组件
└── package.json         # 包含 Electron 配置
```

## Electron API

在渲染进程（React 组件）中可以使用以下 API：

```typescript
// 打开终端
await window.electron.openTerminal('/path/to/directory');

// 获取平台信息
const platform = await window.electron.getPlatform();
// { platform: 'darwin', arch: 'x64', version: '...' }

// 检查是否在 Electron 环境
if (window.electron?.isElectron) {
  // 在 Electron 中运行
}
```

## 终端打开功能

### Electron 应用中
点击项目的本地路径 → 自动打开终端到该目录 ✅

### Web 浏览器中
点击项目的本地路径 → 复制路径到剪贴板 + 显示提示

## 配置说明

### 修改窗口大小

编辑 `electron/main.js`:

```javascript
mainWindow = new BrowserWindow({
  width: 1400,  // 修改宽度
  height: 900,  // 修改高度
  // ...
});
```

### 修改应用图标

1. 准备图标文件：
   - macOS: `icon.icns`
   - Windows: `icon.ico`
   - Linux: `icon.png`

2. 放置在 `assets/` 目录

3. 更新 `package.json` 中的 `build.icon` 配置

### 修改应用名称

编辑 `package.json`:

```json
{
  "build": {
    "productName": "你的应用名称"
  }
}
```

## 常见问题

### Q: 开发模式下 Electron 窗口打开失败？
A: 确保 Next.js 服务器已启动（端口 3004）。可以先运行 `pnpm dev`，然后在另一个终端运行 `pnpm electron`。

### Q: 打包后的应用无法启动？
A: 检查 `package.json` 中的 `main` 字段是否正确指向 `electron/main.js`。

### Q: 终端打开功能不工作？
A: 
- macOS: 确保 Terminal.app 存在
- Windows: 确保 cmd.exe 可用
- Linux: 安装 gnome-terminal 或其他终端模拟器

### Q: 如何同时支持 Web 和 Electron？
A: 代码已自动检测运行环境：
- Electron 中使用 IPC API
- Web 浏览器中降级为复制路径

## 技术栈

- **Electron**: 桌面应用框架
- **Next.js**: Web 应用框架
- **React**: UI 框架
- **IPC**: 主进程与渲染进程通信
- **electron-builder**: 打包工具

## 安全说明

- 使用 `contextIsolation: true` 隔离上下文
- 使用 `nodeIntegration: false` 禁用 Node.js 集成
- 通过 preload 脚本暴露安全的 API
- 仅允许特定的 IPC 通道

## 更新日志

### v1.0.0
- ✅ 集成 Electron
- ✅ 支持打开本地终端
- ✅ 跨平台打包配置
- ✅ 开发和生产环境配置
