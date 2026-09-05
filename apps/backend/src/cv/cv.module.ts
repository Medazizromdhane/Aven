import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { CvParserService } from './cv-parser.service';
import { CvExtractorService } from './cv-extractor.service';

@Module({
  controllers: [CvController],
  providers: [CvService, CvParserService, CvExtractorService],
  exports: [CvService],
})
export class CvModule {}
