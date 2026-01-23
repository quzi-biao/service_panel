import { FileParser } from './types';
import { JavaScriptParser } from './JavaScriptParser';
import { JavaParser } from './JavaParser';
import { PythonParser } from './PythonParser';

export class FileParserFactory {
  private parsers: FileParser[];

  constructor() {
    this.parsers = [
      new JavaScriptParser(),
      new JavaParser(),
      new PythonParser(),
    ];
  }

  getParser(filePath: string): FileParser | null {
    for (const parser of this.parsers) {
      if (parser.canParse(filePath)) {
        return parser;
      }
    }
    return null;
  }

  canParse(filePath: string): boolean {
    return this.parsers.some(parser => parser.canParse(filePath));
  }
}
