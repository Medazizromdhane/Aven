import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

/**
 * Renders plain-text / lightly-structured content into an ATS-friendly PDF.
 * Kept intentionally simple (single column, standard fonts) for ATS parsing.
 */
@Injectable()
export class PdfService {
  async render(title: string, body: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 56 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.font('Helvetica-Bold').fontSize(18).text(title, { align: 'left' });
      doc.moveDown(0.5);
      doc.font('Helvetica').fontSize(11);

      for (const rawLine of body.split('\n')) {
        const line = rawLine.replace(/\r/g, '');
        if (/^#{1,3}\s+/.test(line)) {
          doc.moveDown(0.4);
          doc.font('Helvetica-Bold').fontSize(13).text(line.replace(/^#{1,3}\s+/, ''));
          doc.font('Helvetica').fontSize(11);
        } else if (/^\s*[-*]\s+/.test(line)) {
          doc.text(`• ${line.replace(/^\s*[-*]\s+/, '')}`, { indent: 12 });
        } else if (line.trim() === '') {
          doc.moveDown(0.4);
        } else {
          doc.text(line);
        }
      }

      doc.end();
    });
  }
}
