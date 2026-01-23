// Electron API 类型定义
interface ElectronAPI {
  openTerminal: (path: string) => Promise<{ success: boolean }>;
  getPlatform: () => Promise<{ platform: string; arch: string; version: string }>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
