import { VisaAnalysisService } from './visa-analysis.service';

describe('VisaAnalysisService.keywordAnalysis', () => {
  const service = new VisaAnalysisService({} as never);

  it('detects visa sponsorship keywords', () => {
    const r = service.keywordAnalysis('We offer visa sponsorship and a relocation package.');
    expect(r.hasVisaSponsorship).toBe(true);
    expect(r.relocationSupport).toBe(true);
    expect(r.confidence).toBeGreaterThan(0.5);
  });

  it('respects negative statements', () => {
    const r = service.keywordAnalysis('Sorry, no visa sponsorship is available for this role.');
    expect(r.hasVisaSponsorship).toBe(false);
  });

  it('returns low confidence when nothing matches', () => {
    const r = service.keywordAnalysis('A great job for a great person.');
    expect(r.hasVisaSponsorship).toBe(false);
    expect(r.confidence).toBeLessThan(0.3);
  });
});
