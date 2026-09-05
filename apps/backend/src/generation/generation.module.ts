import { Module } from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { PdfService } from './pdf.service';

@Module({
  controllers: [GenerationController],
  providers: [GenerationService, PdfService],
  exports: [GenerationService],
})
export class GenerationModule {}
