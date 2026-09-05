import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { MatchingEngine } from './matching.engine';

@Module({
  controllers: [MatchingController],
  providers: [MatchingService, MatchingEngine],
  exports: [MatchingService, MatchingEngine],
})
export class MatchingModule {}
