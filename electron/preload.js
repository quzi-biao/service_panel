const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electron', {
  // 打开终端
  openTerminal: (path) => ipcRenderer.invoke('open-terminal', path),
  
  // 获取平台信息
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // 使用默认浏览器打开 URL
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // 检查是否在 Electron 环境中
  isElectron: true
});
