import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobsCronService } from './jobs.cron.service';
import { VisaAnalysisService } from './visa-analysis.service';
import { jobProvidersProvider } from './jobs.providers';
import { GreenhouseProvider } from './providers/greenhouse.provider';
import { LeverProvider } from './providers/lever.provider';
import { RemotiveProvider } from './providers/remotive.provider';
import { TheMuseProvider } from './providers/themuse.provider';
import { AdzunaProvider } from './providers/adzuna.provider';
import { JSearchProvider } from './providers/jsearch.provider';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JobsController],
  providers: [
    JobsService,
    JobsCronService,
    VisaAnalysisService,
    GreenhouseProvider,
    LeverProvider,
    RemotiveProvider,
    TheMuseProvider,
    AdzunaProvider,
    JSearchProvider,
    jobProvidersProvider,
  ],
  exports: [JobsService, VisaAnalysisService],
})
export class JobsModule {}
