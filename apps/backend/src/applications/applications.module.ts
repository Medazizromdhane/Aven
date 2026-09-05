import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [MatchingModule],
  controllers: [ApplicationsController, DashboardController],
  providers: [ApplicationsService, DashboardService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
