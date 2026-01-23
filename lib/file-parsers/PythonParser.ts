import { FileParser, ParseResult, FileRelation } from './types';

export class PythonParser implements FileParser {
  canParse(filePath: string): boolean {
    return filePath.endsWith('.py');
  }

  parse(filePath: string, content: string): ParseResult {
    const relations: FileRelation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // import module
      const importMatch = trimmedLine.match(/^import\s+([a-zA-Z0-9_.]+)/);
      if (importMatch) {
        relations.push({
          targetFile: importMatch[1],
          relationType: 'IMPORTS',
          lineNumber: index + 1,
        });
      }

      // from module import ...
      const fromImportMatch = trimmedLine.match(/^from\s+([a-zA-Z0-9_.]+)\s+import/);
      if (fromImportMatch) {
        relations.push({
          targetFile: fromImportMatch[1],
          relationType: 'IMPORTS',
          lineNumber: index + 1,
        });
      }

      // class inheritance
      const classMatch = trimmedLine.match(/^class\s+\w+\(([^)]+)\)/);
      if (classMatch) {
        const baseClasses = classMatch[1].split(',').map(c => c.trim());
        baseClasses.forEach(baseClass => {
          relations.push({
            targetFile: baseClass,
            relationType: 'EXTENDS',
            lineNumber: index + 1,
          });
        });
      }
    });

    return { relations };
  }
}
