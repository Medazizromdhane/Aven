import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { LlmModule } from './llm/llm.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CvModule } from './cv/cv.module';
import { JobsModule } from './jobs/jobs.module';
import { MatchingModule } from './matching/matching.module';
import { GenerationModule } from './generation/generation.module';
import { ApplicationsModule } from './applications/applications.module';
import { StorageModule } from './storage/storage.module';
import { HealthController } from './health.controller';
import { KeepAliveService } from './keep-alive.service';

@Module({
  controllers: [HealthController],
  providers: [KeepAliveService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    StorageModule,
    LlmModule,
    AuthModule,
    UsersModule,
    CvModule,
    JobsModule,
    MatchingModule,
    GenerationModule,
    ApplicationsModule,
  ],
})
export class AppModule {}
