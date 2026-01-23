import { RowDataPacket } from 'mysql2';

export interface FileContent extends RowDataPacket {
  id: number;
  file_path: string;
  file_name: string;
  content: string;
}

/**
 * 查找 Java 目标文件
 * @param targetFilePath 目标文件路径（可能是包名格式，如 com.example.MyClass）
 * @param fileContents 所有文件内容列表
 * @returns 找到的目标文件，如果未找到则返回 null
 */
export function findJavaTargetFile(
  targetFilePath: string,
  fileContents: FileContent[]
): FileContent | null {
  let targetFile: FileContent | null = null;

  // 策略1: 精确匹配
  targetFile = fileContents.find(f => f.file_path === targetFilePath) || null;
  if (targetFile) {
    return targetFile;
  }

  // 策略2: 将包名转换为文件路径
  if (targetFilePath.includes('.')) {
    const className = targetFilePath.split('.').pop();
    const packagePath = targetFilePath.replace(/\./g, '/');
    
    const searchPaths = [
      packagePath + '.java',
      className + '.java',
    ];

    for (const searchPath of searchPaths) {
      targetFile = fileContents.find(f => f.file_path === searchPath) || null;
      if (targetFile) {
        return targetFile;
      }
    }

    // 策略3: 尝试匹配包路径（模糊匹配）
    targetFile = fileContents.find(f =>
      f.file_path.endsWith(packagePath + '.java') ||
      f.file_path.includes('/' + packagePath + '.java')
    ) || null;
    if (targetFile) {
      return targetFile;
    }
  }

  // 策略4: 文件名匹配（不含路径）
  const targetFileName = targetFilePath.split('.').pop();
  if (targetFileName) {
    targetFile = fileContents.find(f => {
      const fileName = f.file_name || f.file_path.split('/').pop();
      return fileName === targetFileName + '.java' || fileName === targetFileName;
    }) || null;
  }

  return targetFile;
}

/**
 * 查找前端目标文件（JS/TS/Vue 等）
 * @param targetFilePath 目标文件路径
 * @param fileContents 所有文件内容列表
 * @returns 找到的目标文件，如果未找到则返回 null
 */
export function findFrontendTargetFile(
  targetFilePath: string,
  fileContents: FileContent[]
): FileContent | null {
  let targetFile: FileContent | null = null;
  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.mjs', '.cjs'];

  // 策略1: 精确匹配
  targetFile = fileContents.find(f => f.file_path === targetFilePath) || null;
  if (targetFile) {
    return targetFile;
  }

  // 策略2: 文件名匹配（带扩展名）
  targetFile = fileContents.find(f =>
    extensions.some(ext => f.file_path.endsWith('/' + targetFilePath + ext))
  ) || null;
  if (targetFile) {
    return targetFile;
  }

  // 策略3: 路径包含匹配
  targetFile = fileContents.find(f =>
    f.file_path.includes(targetFilePath) ||
    f.file_path.endsWith('/' + targetFilePath)
  ) || null;
  if (targetFile) {
    return targetFile;
  }

  // 策略4: 文件名匹配（不含路径）
  const targetFileName = targetFilePath.split('/').pop();
  if (targetFileName) {
    targetFile = fileContents.find(f => {
      const fileName = f.file_name || f.file_path.split('/').pop();
      return fileName === targetFileName ||
        extensions.some(ext => fileName === targetFileName + ext);
    }) || null;
  }

  return targetFile;
}

/**
 * 查找目标文件（统一入口）
 * @param targetFilePath 目标文件路径
 * @param currentFilePath 当前文件路径
 * @param fileContents 所有文件内容列表
 * @returns 找到的目标文件，如果未找到则返回 null
 */
export function findTargetFile(
  targetFilePath: string,
  currentFilePath: string,
  fileContents: FileContent[]
): FileContent | null {
  if (currentFilePath.endsWith('.java')) {
    return findJavaTargetFile(targetFilePath, fileContents);
  } else {
    return findFrontendTargetFile(targetFilePath, fileContents);
  }
}
