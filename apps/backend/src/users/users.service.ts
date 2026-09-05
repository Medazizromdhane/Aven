import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _omit, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { fullName, ...profileData } = dto;

    if (
      profileData.desiredSalaryMin !== undefined &&
      profileData.desiredSalaryMax !== undefined &&
      profileData.desiredSalaryMax < profileData.desiredSalaryMin
    ) {
      throw new BadRequestException('Maximum salary must be greater than or equal to minimum salary');
    }

    const normalizedProfileData = {
      ...profileData,
      skills: this.normalizeList(profileData.skills),
      favoriteTech: this.normalizeList(profileData.favoriteTech),
      languages: this.normalizeList(profileData.languages),
      certifications: this.normalizeList(profileData.certifications),
      targetCountries: this.normalizeList(profileData.targetCountries),
    };

    if (fullName !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fullName: fullName.trim() || null },
      });
    }

    await this.prisma.profile.upsert({
      where: { userId },
      create: { userId, ...normalizedProfileData },
      update: normalizedProfileData,
    });

    return this.getProfile(userId);
  }

  private normalizeList(values?: string[]): string[] | undefined {
    if (values === undefined) return undefined;
    return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
  }
}
