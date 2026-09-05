import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

/**
 * Daily autonomous job hunt: aggregates jobs based on the union of all users'
 * target countries and favorite technologies.
 */
@Injectable()
export class JobsCronService {
  private readonly logger = new Logger(JobsCronService.name);

  constructor(private readonly jobs: JobsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async dailyHunt() {
    this.logger.log('Starting daily job hunt');
    const result = await this.jobs.dailyHunt();
    this.logger.log(`Daily hunt done: ${JSON.stringify(result)}`);
  }
}
