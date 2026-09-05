import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CvParserService } from './cv-parser.service';
import { CvExtractorService } from './cv-extractor.service';

@Injectable()
export class CvService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly parser: CvParserService,
    private readonly extractor: CvExtractorService,
  ) {}

  async uploadAndParse(
    userId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const rawText = await this.parser.extractText(file.buffer, file.mimetype);
    if (rawText.length < 20) {
      throw new UnprocessableEntityException(
        'We could not read enough text from this file. Please upload a text-based PDF or DOCX.',
      );
    }
    const parsed = await this.extractor.extract(rawText);
    const fileUrl = await this.storage.upload(file.buffer, file.mimetype, `cvs/${userId}`);

    // First CV becomes primary.
    const count = await this.prisma.cv.count({ where: { userId } });
    const isPrimary = count === 0;

    const cv = await this.prisma.cv.create({
      data: {
        userId,
        isPrimary,
        fileName: file.originalname,
        fileUrl,
        mimeType: file.mimetype,
        rawText,
        parsed: parsed as unknown as object,
        fullName: parsed.fullName ?? undefined,
        email: parsed.email ?? undefined,
        phone: parsed.phone ?? undefined,
        country: parsed.country ?? undefined,
        skills: parsed.skills,
        languages: parsed.languages,
        certifications: parsed.certifications,
        yearsOfExp: parsed.yearsOfExperience ?? 0,
        experiences: {
          create: parsed.experiences.map((e) => ({
            title: e.title,
            company: e.company ?? undefined,
            location: e.location ?? undefined,
            startDate: e.startDate ?? undefined,
            endDate: e.endDate ?? undefined,
            current: e.current ?? false,
            summary: e.summary ?? undefined,
            skills: e.skills ?? [],
          })),
        },
        educations: {
          create: parsed.educations.map((e) => ({
            degree: e.degree ?? undefined,
            field: e.field ?? undefined,
            school: e.school ?? undefined,
            startDate: e.startDate ?? undefined,
            endDate: e.endDate ?? undefined,
          })),
        },
      },
      include: { experiences: true, educations: true },
    });

    // Sync profile with extracted facts when it becomes the primary CV.
    if (isPrimary) {
      await this.prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          phone: parsed.phone ?? undefined,
          country: parsed.country ?? undefined,
          yearsOfExperience: parsed.yearsOfExperience ?? 0,
          skills: parsed.skills,
          languages: parsed.languages,
          certifications: parsed.certifications,
        },
        update: {
          phone: parsed.phone ?? undefined,
          country: parsed.country ?? undefined,
          yearsOfExperience: parsed.yearsOfExperience ?? 0,
          skills: parsed.skills,
          languages: parsed.languages,
          certifications: parsed.certifications,
        },
      });
    }

    return cv;
  }

  list(userId: string) {
    return this.prisma.cv.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { experiences: true, educations: true },
    });
  }

  async get(userId: string, id: string) {
    const cv = await this.prisma.cv.findFirst({
      where: { id, userId },
      include: { experiences: true, educations: true },
    });
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    return cv;
  }

  async setPrimary(userId: string, id: string) {
    await this.get(userId, id);
    await this.prisma.cv.updateMany({ where: { userId }, data: { isPrimary: false } });
    return this.prisma.cv.update({ where: { id }, data: { isPrimary: true } });
  }

  async download(userId: string, id: string) {
    const cv = await this.get(userId, id);
    const buffer = await this.storage.download(cv.fileUrl);
    return { buffer, fileName: cv.fileName, mimeType: cv.mimeType };
  }

  async remove(userId: string, id: string) {
    const cv = await this.get(userId, id);
    await this.prisma.cv.delete({ where: { id } });

    if (cv.isPrimary) {
      const replacement = await this.prisma.cv.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (replacement) {
        await this.prisma.cv.update({ where: { id: replacement.id }, data: { isPrimary: true } });
      }
    }

    await this.storage.remove(cv.fileUrl).catch(() => undefined);
    return { deleted: true };
  }
}
