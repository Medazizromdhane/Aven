import { PrismaClient, JobSource } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds a couple of demo jobs so the UI has data before the first crawl.
 */
async function main() {
  if (process.env.SEED_DEMO_DATA !== 'true') {
    console.log('Demo seed disabled. Set SEED_DEMO_DATA=true to add local sample jobs.');
    return;
  }

  await prisma.job.upsert({
    where: { source_sourceId: { source: JobSource.MANUAL, sourceId: 'demo-1' } },
    create: {
      source: JobSource.MANUAL,
      sourceId: 'demo-1',
      title: 'Senior Backend Engineer',
      company: 'DemoCorp',
      location: 'Berlin, Germany',
      country: 'Germany',
      remote: false,
      description:
        'We are hiring a backend engineer. Visa sponsorship available and we offer a full relocation package to Germany. Tech: Node.js, TypeScript, PostgreSQL.',
      url: 'https://example.com/jobs/demo-1',
      applyUrl: 'https://example.com/jobs/demo-1/apply',
      salaryMin: 70000,
      salaryMax: 95000,
      currency: 'EUR',
      tags: ['Node.js', 'TypeScript', 'PostgreSQL'],
      hasVisaSponsorship: true,
      visaConfidence: 0.9,
      visaKeywords: ['visa sponsorship', 'relocation package'],
      relocationSupport: true,
      postedAt: new Date(),
    },
    update: {},
  });

  await prisma.job.upsert({
    where: { source_sourceId: { source: JobSource.MANUAL, sourceId: 'demo-2' } },
    create: {
      source: JobSource.MANUAL,
      sourceId: 'demo-2',
      title: 'Full Stack Developer (Remote)',
      company: 'RemoteHub',
      location: 'Remote',
      country: 'Anywhere',
      remote: true,
      description:
        'Remote full stack role using React and NestJS. Global team. English required.',
      url: 'https://example.com/jobs/demo-2',
      tags: ['React', 'NestJS'],
      currency: 'USD',
      hasVisaSponsorship: false,
      postedAt: new Date(),
    },
    update: {},
  });

  console.log('Seeded demo jobs.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
