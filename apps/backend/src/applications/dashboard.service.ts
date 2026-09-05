import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string) {
    const [matchAgg, applications, topCountries, topCompanies, jobsWithVisa] = await Promise.all([
      this.prisma.jobMatch.aggregate({
        where: { userId },
        _avg: { score: true },
        _count: true,
      }),
      this.prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.job.groupBy({
        by: ['country'],
        where: { matches: { some: { userId } } },
        _count: true,
        orderBy: { _count: { country: 'desc' } },
        take: 5,
      }),
      this.prisma.job.groupBy({
        by: ['company'],
        where: { matches: { some: { userId } } },
        _count: true,
        orderBy: { _count: { company: 'desc' } },
        take: 5,
      }),
      this.prisma.jobMatch.count({
        where: { userId, job: { hasVisaSponsorship: true } },
      }),
    ]);

    const statusCount = (s: ApplicationStatus) =>
      applications.find((a) => a.status === s)?._count ?? 0;

    const totalApplied =
      statusCount(ApplicationStatus.APPLIED) +
      statusCount(ApplicationStatus.INTERVIEW) +
      statusCount(ApplicationStatus.OFFER) +
      statusCount(ApplicationStatus.REJECTED);
    const interviews = statusCount(ApplicationStatus.INTERVIEW) + statusCount(ApplicationStatus.OFFER);

    return {
      jobsDetected: matchAgg._count,
      jobsWithVisa,
      averageScore: Math.round(matchAgg._avg.score ?? 0),
      applications: {
        saved: statusCount(ApplicationStatus.SAVED),
        applied: statusCount(ApplicationStatus.APPLIED),
        pending: statusCount(ApplicationStatus.PENDING),
        interview: statusCount(ApplicationStatus.INTERVIEW),
        offer: statusCount(ApplicationStatus.OFFER),
        rejected: statusCount(ApplicationStatus.REJECTED),
      },
      conversion: {
        applied: totalApplied,
        interviewRate: totalApplied ? Math.round((interviews / totalApplied) * 100) : 0,
        offerRate: totalApplied
          ? Math.round((statusCount(ApplicationStatus.OFFER) / totalApplied) * 100)
          : 0,
      },
      byCountry: topCountries.map((c) => ({ country: c.country ?? 'Unknown', count: c._count })),
      byCompany: topCompanies.map((c) => ({ company: c.company, count: c._count })),
    };
  }
}
