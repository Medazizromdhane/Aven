import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MatchingEngine } from '../matching/matching.engine';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: MatchingEngine,
  ) {}

  /**
   * Save a job as an application. Ensures a JobMatch exists (creating one
   * on the fly if the user hasn't run matching yet).
   */
  async create(userId: string, dto: CreateApplicationDto) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    let match = await this.prisma.jobMatch.findUnique({
      where: { userId_jobId: { userId, jobId: dto.jobId } },
    });

    if (!match) {
      const profile = await this.prisma.profile.findUnique({ where: { userId } });
      const scored = profile
        ? this.engine.score(profile, job)
        : { score: 0, breakdown: {}, reasons: [] };
      match = await this.prisma.jobMatch.create({
        data: {
          userId,
          jobId: dto.jobId,
          score: scored.score,
          breakdown: scored.breakdown as unknown as object,
          reasons: scored.reasons,
        },
      });
    }

    const existing = await this.prisma.application.findUnique({
      where: { matchId: match.id },
    });
    if (existing) return existing;

    return this.prisma.application.create({
      data: { userId, matchId: match.id, status: ApplicationStatus.SAVED },
    });
  }

  list(userId: string, status?: ApplicationStatus) {
    return this.prisma.application.findMany({
      where: { userId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: 'desc' },
      include: { match: { include: { job: true } } },
    });
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');

    const appliedAt =
      dto.status === ApplicationStatus.APPLIED && !app.appliedAt ? new Date() : app.appliedAt;

    return this.prisma.application.update({
      where: { id },
      data: { status: dto.status, notes: dto.notes, appliedAt },
    });
  }

  async remove(userId: string, id: string) {
    const app = await this.prisma.application.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');
    await this.prisma.application.delete({ where: { id } });
    return { deleted: true };
  }
}
