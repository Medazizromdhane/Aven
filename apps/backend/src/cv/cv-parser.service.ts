import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
// pdf-parse has no bundled types export default function; require to avoid ESM issues.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

@Injectable()
export class CvParserService {
  private readonly logger = new Logger(CvParserService.name);

  /**
   * Extract raw text from a PDF or DOCX buffer.
   */
  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(buffer);
        return this.clean(data.text);
      }
      if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer });
        return this.clean(result.value);
      }
      // Fallback: treat as UTF-8 text
      return this.clean(buffer.toString('utf-8'));
    } catch (err) {
      this.logger.error(`Failed to extract text: ${(err as Error).message}`);
      return '';
    }
  }

  private clean(text: string): string {
    return text
      .replace(/\r/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
