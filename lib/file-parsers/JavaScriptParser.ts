import { FileParser, ParseResult, FileRelation } from './types';

export class JavaScriptParser implements FileParser {
  private extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.mjs', '.cjs'];

  canParse(filePath: string): boolean {
    return this.extensions.some(ext => filePath.endsWith(ext));
  }

  parse(filePath: string, content: string): ParseResult {
    const relations: FileRelation[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // ES6 import statements
      // import ... from 'module'
      const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        relations.push({
          targetFile: this.resolveImportPath(importPath, filePath),
          relationType: this.getRelationType(importPath),
          lineNumber: index + 1,
        });
      }

      // import('module') - dynamic import
      const dynamicImportMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (dynamicImportMatch) {
        const importPath = dynamicImportMatch[1];
        relations.push({
          targetFile: this.resolveImportPath(importPath, filePath),
          relationType: this.getRelationType(importPath),
          lineNumber: index + 1,
        });
      }

      // require('module')
      const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (requireMatch) {
        const importPath = requireMatch[1];
        relations.push({
          targetFile: this.resolveImportPath(importPath, filePath),
          relationType: this.getRelationType(importPath),
          lineNumber: index + 1,
        });
      }

      // class extends
      const extendsMatch = line.match(/class\s+\w+\s+extends\s+(\w+)/);
      if (extendsMatch) {
        relations.push({
          targetFile: extendsMatch[1],
          relationType: 'EXTENDS',
          lineNumber: index + 1,
        });
      }

      // implements (TypeScript)
      const implementsMatch = line.match(/class\s+\w+\s+implements\s+([\w,\s]+)/);
      if (implementsMatch) {
        const interfaces = implementsMatch[1].split(',').map(i => i.trim());
        interfaces.forEach(interfaceName => {
          relations.push({
            targetFile: interfaceName,
            relationType: 'IMPLEMENTS',
            lineNumber: index + 1,
          });
        });
      }

      // Vue component imports in <script> tags
      if (filePath.endsWith('.vue')) {
        const vueImportMatch = line.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
        if (vueImportMatch) {
          relations.push({
            targetFile: this.resolveImportPath(vueImportMatch[2], filePath),
            relationType: 'IMPORTS',
            lineNumber: index + 1,
          });
        }
      }

      // Image file references in src attributes (img, Image, etc.)
      // Matches: src="/path/to/image.png", src='/path/to/image.jpg', src={"/path/to/image.svg"}
      const srcMatches = line.matchAll(/src\s*=\s*[{]?\s*['"]([^'"]+\.(png|jpg|jpeg|gif|svg|webp|ico|bmp))['"]\s*[}]?/gi);
      for (const srcMatch of srcMatches) {
        const imagePath = srcMatch[1];
        relations.push({
          targetFile: this.resolveImportPath(imagePath, filePath),
          relationType: 'IMPORTS_IMAGE',
          lineNumber: index + 1,
        });
      }

      // Background image references in style attributes
      // Matches: backgroundImage: "url('/path/to/image.png')", background: url('/path/to/image.jpg')
      const bgImageMatches = line.matchAll(/(?:background-image|backgroundImage|background)\s*:\s*['"]?\s*url\s*\(\s*['"]([^'"]+\.(png|jpg|jpeg|gif|svg|webp|ico|bmp))['"]\s*\)/gi);
      for (const bgMatch of bgImageMatches) {
        const imagePath = bgMatch[1];
        relations.push({
          targetFile: this.resolveImportPath(imagePath, filePath),
          relationType: 'IMPORTS_IMAGE',
          lineNumber: index + 1,
        });
      }
    });

    return { relations };
  }

  private getRelationType(importPath: string): 'IMPORTS' | 'EXTENDS' | 'IMPLEMENTS' | 'REQUIRES' | 'INCLUDES' | 'REFERENCES' | 'IMPORTS_CSS' | 'IMPORTS_IMAGE' | 'IMPORTS_FONT' | 'IMPORTS_DATA' | 'IMPORTS_ASSET' {
    // CSS files
    if (/\.(css|scss|sass|less|styl)$/i.test(importPath)) {
      return 'IMPORTS_CSS';
    }
    
    // Image files
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico|bmp)$/i.test(importPath)) {
      return 'IMPORTS_IMAGE';
    }
    
    // Font files
    if (/\.(woff|woff2|ttf|eot|otf)$/i.test(importPath)) {
      return 'IMPORTS_FONT';
    }
    
    // JSON/Data files
    if (/\.(json|xml|yaml|yml|csv)$/i.test(importPath)) {
      return 'IMPORTS_DATA';
    }
    
    // Other asset files
    if (/\.(mp4|webm|mp3|wav|pdf|zip|txt|md)$/i.test(importPath)) {
      return 'IMPORTS_ASSET';
    }
    
    // Default to IMPORTS for code files
    return 'IMPORTS';
  }

  private resolveImportPath(importPath: string, currentFile: string): string {
    // Check if it's an asset file (CSS, image, etc.)
    const isAsset = /\.(css|scss|sass|less|styl|png|jpg|jpeg|gif|svg|webp|ico|bmp|woff|woff2|ttf|eot|otf|json|xml|yaml|yml|csv|mp4|webm|mp3|wav|pdf|zip|txt|md)$/i.test(importPath);
    
    // Only remove JS/TS extensions, keep asset file extensions
    if (!isAsset) {
      importPath = importPath.replace(/\.(js|jsx|ts|tsx|vue|mjs|cjs)$/, '');
    }
    
    // Handle relative imports
    if (importPath.startsWith('.')) {
      const currentDir = currentFile.split('/').slice(0, -1).join('/');
      const parts = importPath.split('/');
      const dirParts = currentDir.split('/');
      
      for (const part of parts) {
        if (part === '..') {
          dirParts.pop();
        } else if (part !== '.') {
          dirParts.push(part);
        }
      }
      
      return dirParts.join('/');
    }
    
    // Return as-is for absolute or package imports
    return importPath;
  }
}
