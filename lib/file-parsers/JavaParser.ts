import { FileParser, ParseResult, FileRelation } from './types';

export class JavaParser implements FileParser {
  canParse(filePath: string): boolean {
    return filePath.endsWith('.java');
  }

  parse(filePath: string, content: string): ParseResult {
    const relations: FileRelation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // import statements
      const importMatch = trimmedLine.match(/^import\s+(static\s+)?([a-zA-Z0-9_.]+);/);
      if (importMatch) {
        const importedClass = importMatch[2];
        relations.push({
          targetFile: importedClass,
          relationType: 'IMPORTS',
          lineNumber: index + 1,
        });
      }

      // class extends
      const extendsMatch = trimmedLine.match(/class\s+\w+\s+extends\s+([a-zA-Z0-9_<>,.]+)/);
      if (extendsMatch) {
        const baseClass = extendsMatch[1].split('<')[0].trim();
        relations.push({
          targetFile: baseClass,
          relationType: 'EXTENDS',
          lineNumber: index + 1,
        });
      }

      // implements
      const implementsMatch = trimmedLine.match(/class\s+\w+.*?implements\s+([a-zA-Z0-9_<>,.]+)/);
      if (implementsMatch) {
        const interfaces = implementsMatch[1]
          .split(',')
          .map(i => i.split('<')[0].trim());
        
        interfaces.forEach(interfaceName => {
          relations.push({
            targetFile: interfaceName,
            relationType: 'IMPLEMENTS',
            lineNumber: index + 1,
          });
        });
      }

      // interface extends
      const interfaceExtendsMatch = trimmedLine.match(/interface\s+\w+\s+extends\s+([a-zA-Z0-9_<>,.]+)/);
      if (interfaceExtendsMatch) {
        const baseInterfaces = interfaceExtendsMatch[1]
          .split(',')
          .map(i => i.split('<')[0].trim());
        
        baseInterfaces.forEach(interfaceName => {
          relations.push({
            targetFile: interfaceName,
            relationType: 'EXTENDS',
            lineNumber: index + 1,
          });
        });
      }
    });

    return { relations };
  }
}
