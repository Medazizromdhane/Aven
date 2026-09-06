import { Injectable, Logger } from '@nestjs/common';
import { GroqService } from '../llm/mistral.service';

export interface VisaAnalysis {
  hasVisaSponsorship: boolean;
  relocationSupport: boolean;
  confidence: number; // 0..1
  keywords: string[];
}

const VISA_KEYWORDS = [
  'visa sponsorship',
  'sponsor a visa',
  'sponsorship available',
  'will sponsor',
  'work permit',
  'work visa',
  'relocation package',
  'relocation assistance',
  'relocation support',
  'immigration support',
  'h1b sponsorship',
  'h-1b',
  'tier 2 sponsorship',
  'skilled worker visa',
  'blue card',
  'employer of record',
  'we sponsor',
];

const RELOCATION_KEYWORDS = [
  'relocation package',
  'relocation assistance',
  'relocation support',
  'relocation bonus',
  'help you relocate',
  'cover relocation',
];

const NEGATIVE_KEYWORDS = [
  'no visa sponsorship',
  'not able to sponsor',
  'cannot sponsor',
  'unable to sponsor',
  'no sponsorship',
  'without sponsorship',
  'must be authorized to work',
  'do not offer sponsorship',
];

@Injectable()
export class VisaAnalysisService {
  private readonly logger = new Logger(VisaAnalysisService.name);

  constructor(private readonly mistral: GroqService) {}

  /**
   * Fast, deterministic keyword pass. Runs on every job (free, no API cost).
   */
  keywordAnalysis(text: string): VisaAnalysis {
    const lower = text.toLowerCase();

    const negatives = NEGATIVE_KEYWORDS.filter((k) => lower.includes(k));
    if (negatives.length > 0) {
      return { hasVisaSponsorship: false, relocationSupport: false, confidence: 0.9, keywords: [] };
    }

    const matched = VISA_KEYWORDS.filter((k) => lower.includes(k));
    const reloc = RELOCATION_KEYWORDS.filter((k) => lower.includes(k));

    const has = matched.length > 0;
    // Confidence grows with the number of distinct signals.
    const confidence = has ? Math.min(0.5 + matched.length * 0.15, 0.95) : 0.1;

    return {
      hasVisaSponsorship: has,
      relocationSupport: reloc.length > 0,
      confidence,
      keywords: Array.from(new Set([...matched, ...reloc])),
    };
  }

  /**
   * Optional LLM semantic pass for ambiguous descriptions. Use sparingly
   * (costs tokens) — e.g. only when keyword confidence is in a gray zone.
   */
  async semanticAnalysis(title: string, description: string): Promise<VisaAnalysis> {
    const result = await this.mistral.chatJson<{
      sponsorship: boolean;
      relocation: boolean;
      confidence: number;
      evidence: string[];
    }>(
      [
        {
          role: 'system',
          content:
            'You analyze job posts for international candidates. Determine if the employer offers visa/work-permit sponsorship or relocation support. Return JSON: {"sponsorship": bool, "relocation": bool, "confidence": 0..1, "evidence": string[]}. Only mark true if the text genuinely implies it.',
        },
        { role: 'user', content: `Title: ${title}\n\n${description.slice(0, 4000)}` },
      ],
      { sponsorship: false, relocation: false, confidence: 0.1, evidence: [] },
      { small: true, temperature: 0 },
    );

    return {
      hasVisaSponsorship: result.sponsorship,
      relocationSupport: result.relocation,
      confidence: result.confidence,
      keywords: result.evidence ?? [],
    };
  }

  /**
   * Combined analysis: keyword-first, escalate to LLM only in the gray zone.
   */
  async analyze(title: string, description: string, useLlm = false): Promise<VisaAnalysis> {
    const kw = this.keywordAnalysis(`${title} ${description}`);
    const grayZone = !kw.hasVisaSponsorship && kw.confidence < 0.3;
    if (useLlm && grayZone) {
      try {
        return await this.semanticAnalysis(title, description);
      } catch {
        return kw;
      }
    }
    return kw;
  }
}
