import { MatchingEngine } from './matching.engine';
import { Job, Profile } from '@prisma/client';

describe('MatchingEngine', () => {
  const engine = new MatchingEngine();

  const profile = {
    skills: ['TypeScript', 'Node.js'],
    favoriteTech: ['NestJS'],
    languages: ['English'],
    certifications: [],
    targetCountries: ['Germany'],
    yearsOfExperience: 5,
    desiredSalaryMin: 60000,
    needsVisaSponsor: true,
    workPreferences: [],
  } as unknown as Profile;

  const job = {
    title: 'Senior TypeScript Engineer',
    description: 'We need 3 years experience with TypeScript, Node.js and NestJS.',
    tags: ['TypeScript'],
    country: 'Germany',
    remote: false,
    hasVisaSponsorship: true,
    salaryMax: 90000,
  } as unknown as Job;

  it('produces a score between 0 and 100', () => {
    const result = engine.score(profile, job);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('rewards strong skill and visa overlap', () => {
    const result = engine.score(profile, job);
    expect(result.score).toBeGreaterThan(60);
    expect(result.breakdown.visa).toBe(100);
  });
});
