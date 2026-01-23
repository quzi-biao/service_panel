export interface FileRelation {
  targetFile: string;
  relationType: 'IMPORTS' | 'EXTENDS' | 'IMPLEMENTS' | 'REQUIRES' | 'INCLUDES' | 'REFERENCES' | 'IMPORTS_CSS' | 'IMPORTS_IMAGE' | 'IMPORTS_FONT' | 'IMPORTS_DATA' | 'IMPORTS_ASSET';
  lineNumber?: number;
}

export interface ParseResult {
  relations: FileRelation[];
}

export interface FileParser {
  canParse(filePath: string): boolean;
  parse(filePath: string, content: string): ParseResult;
}
