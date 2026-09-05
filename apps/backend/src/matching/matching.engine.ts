import { Injectable } from '@nestjs/common';
import { Job, Profile } from '@prisma/client';

export interface MatchBreakdown {
  skills: number;
  experience: number;
  location: number;
  salary: number;
  languages: number;
  visa: number;
}

export interface MatchResult {
  score: number; // 0..100
  breakdown: MatchBreakdown;
  reasons: string[];
}

/**
 * Deterministic weighted scoring engine. No API cost — runs on every job.
 */
@Injectable()
export class MatchingEngine {
  private readonly weights = {
    skills: 0.35,
    experience: 0.15,
    location: 0.15,
    salary: 0.1,
    languages: 0.1,
    visa: 0.15,
  };

  score(profile: Profile, job: Job): MatchResult {
    const reasons: string[] = [];
    const jobText = `${job.title} ${job.description} ${job.tags.join(' ')}`.toLowerCase();

    // --- Skills ---
    const profileSkills = [...profile.skills, ...profile.favoriteTech].map((s) =>
      s.toLowerCase(),
    );
    const matchedSkills = profileSkills.filter((s) => s && jobText.includes(s));
    const skillsScore = profileSkills.length
      ? Math.min(matchedSkills.length / Math.max(profileSkills.length * 0.4, 1), 1)
      : 0.3;
    if (matchedSkills.length) {
      reasons.push(`Matches ${matchedSkills.length} of your skills: ${matchedSkills.slice(0, 5).join(', ')}`);
    }

    // --- Experience ---
    const years = profile.yearsOfExperience ?? 0;
    const required = this.extractRequiredYears(jobText);
    let experienceScore = 1;
    if (required != null) {
      experienceScore = years >= required ? 1 : Math.max(years / required, 0.3);
      reasons.push(
        years >= required
          ? `You meet the ~${required}y experience requirement`
          : `Role asks ~${required}y; you have ${years}y`,
      );
    }

    // --- Location / remote ---
    let locationScore = 0.5;
    if (job.remote) {
      locationScore = 1;
      reasons.push('Remote-friendly');
    } else if (profile.targetCountries.length && job.country) {
      const match = profile.targetCountries.some((c) =>
        job.country!.toLowerCase().includes(c.toLowerCase()),
      );
      locationScore = match ? 1 : 0.3;
      if (match) reasons.push(`Located in a target country (${job.country})`);
    }

    // --- Salary ---
    let salaryScore = 0.6;
    if (profile.desiredSalaryMin && job.salaryMax) {
      salaryScore = job.salaryMax >= profile.desiredSalaryMin ? 1 : 0.3;
      if (salaryScore === 1) reasons.push('Salary meets your expectations');
    }

    // --- Languages ---
    const profileLangs = profile.languages.map((l) => l.toLowerCase());
    const langScore = profileLangs.length
      ? profileLangs.some((l) => jobText.includes(l)) || jobText.includes('english')
        ? 1
        : 0.6
      : 0.7;

    // --- Visa ---
    let visaScore = 0.4;
    if (job.hasVisaSponsorship) {
      visaScore = 1;
      reasons.push('Offers visa sponsorship / relocation');
    } else if (!profile.needsVisaSponsor) {
      visaScore = 0.8;
    }

    const breakdown: MatchBreakdown = {
      skills: Math.round(skillsScore * 100),
      experience: Math.round(experienceScore * 100),
      location: Math.round(locationScore * 100),
      salary: Math.round(salaryScore * 100),
      languages: Math.round(langScore * 100),
      visa: Math.round(visaScore * 100),
    };

    const weighted =
      skillsScore * this.weights.skills +
      experienceScore * this.weights.experience +
      locationScore * this.weights.location +
      salaryScore * this.weights.salary +
      langScore * this.weights.languages +
      visaScore * this.weights.visa;

    return {
      score: Math.round(weighted * 100),
      breakdown,
      reasons,
    };
  }

  private extractRequiredYears(text: string): number | null {
    const m = text.match(/(\d+)\+?\s*(?:years|yrs)/);
    return m ? Number(m[1]) : null;
  }
}
