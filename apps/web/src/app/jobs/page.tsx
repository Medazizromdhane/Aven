'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, downloadApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { AppHeader } from '@/components/app-header';
import { Bookmark, ChevronDown, ExternalLink, FileText, Globe2, ListChecks, LoaderCircle, Mail, MapPin, Search, SlidersHorizontal, Sparkles, Target } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  country?: string;
  remote: boolean;
  url: string;
  applyUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  hasVisaSponsorship: boolean;
  relocationSupport: boolean;
  visaKeywords: string[];
  matchScore?: number | null;
  matchReasons?: string[];
  source?: string;
  description?: string;
  postedAt?: string;
}

const countries = [
  ['🌍', 'Tous les pays', ''], ['🇫🇷', 'France', 'France'], ['🇩🇪', 'Allemagne', 'Germany'],
  ['🇬🇧', 'Royaume-Uni', 'United Kingdom'], ['🇨🇦', 'Canada', 'Canada'], ['🇺🇸', 'États-Unis', 'United States'],
  ['🇳🇱', 'Pays-Bas', 'Netherlands'], ['🇦🇺', 'Australie', 'Australia'], ['🇮🇪', 'Irlande', 'Ireland'],
];

export default function JobsPage() {
  const { token, hydrate } = useAuth();
  const { t } = useLanguage();
  const [visaOnly, setVisaOnly] = useState(false);
  const [remote, setRemote] = useState(false);
  const [country, setCountry] = useState('');
  const [tech, setTech] = useState('');
  const [notice, setNotice] = useState('');
  const [searchingLive, setSearchingLive] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [sort, setSort] = useState<'recent' | 'match' | 'visa'>('recent');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const params = new URLSearchParams();
  if (visaOnly) params.set('visaOnly', 'true');
  if (remote) params.set('remote', 'true');
  if (country) params.set('country', country);
  if (tech) params.set('tech', tech);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['jobs', params.toString()],
    queryFn: () => api<Job[]>(`/jobs?${params.toString()}`),
  });

  const sortedJobs = data
    ? [...data].sort((a, b) => {
        if (sort === 'match') return (b.matchScore ?? -1) - (a.matchScore ?? -1);
        if (sort === 'visa') return Number(b.hasVisaSponsorship) - Number(a.hasVisaSponsorship);
        const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return db - da;
      })
    : [];

  async function searchJobs() {
    setSearchingLive(true);
    setNotice(t('searching'));
    try {
      await api('/jobs/search', {
        method: 'POST',
        body: JSON.stringify({
          keywords: tech ? [tech] : ['software engineer'],
          countries: country ? [country] : [],
        }),
      });
      await refetch();
      setNotice(t('liveUpdated'));
    } catch (err) {
      setNotice((err as Error).message);
    } finally {
      setSearchingLive(false);
    }
  }

  async function recommendFromCv() {
    if (!token) {
      setNotice(t('signInToScores'));
      return;
    }
    setRecommending(true);
    setNotice('Analyse de votre CV et classement des offres…');
    try {
      // If the DB is thin, pull fresh listings first, then score against the profile.
      if (!data || data.length < 10) {
        await api('/jobs/search', {
          method: 'POST',
          body: JSON.stringify({ keywords: ['software engineer'], countries: country ? [country] : [] }),
        });
      }
      await api('/matching/recompute', { method: 'POST' });
      await refetch();
      setSort('match');
      setNotice('Offres classées selon votre profil.');
    } catch (err) {
      const message = (err as Error).message;
      setNotice(/profile/i.test(message) ? 'Ajoutez d’abord un CV principal pour obtenir des recommandations.' : message);
    } finally {
      setRecommending(false);
    }
  }

  function clearSearch() {
    setCountry('');
    setTech('');
    setVisaOnly(false);
    setRemote(false);
    setNotice('');
  }

  const externalQuery = encodeURIComponent(`${tech || 'software engineer'} ${country || ''} visa sponsorship`.trim());
  const externalSearches = [
    ['Google Jobs', `https://www.google.com/search?q=${externalQuery}&ibp=htl;jobs`, 'Recherche large'],
    ['LinkedIn', `https://www.linkedin.com/jobs/search/?keywords=${externalQuery}`, 'Réseau professionnel'],
    ['Indeed', `https://www.indeed.com/jobs?q=${externalQuery}`, 'Offres internationales'],
  ];

  return (
    <><AppHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="jobs-hero mb-8"><p className="eyebrow">{t('searchDesk')}</p><h1 className="display-type mt-2 text-4xl">{t('findPlace')}</h1><p className="mt-2 max-w-xl text-[#c4c0dc]">{t('jobsCopy')}</p></header>

      <div className="filter-bar mb-8 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]"><SlidersHorizontal size={16} className="text-[var(--brand)]" /> {t('refineSearch')}</div><div className="flex flex-wrap items-center gap-3">
        <label className="country-select"><Globe2 size={15} /><select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t('country')}>{countries.map(([flag, label, value]) => <option key={label} value={value}>{flag} {label}</option>)}</select></label>
        <input
          placeholder={t('technologies')}
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          className="field"
        />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
          {t('remote')}
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={visaOnly}
            onChange={(e) => setVisaOnly(e.target.checked)}
          />
          {t('visaOnly')}
        </label>
        <button
          onClick={searchJobs}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
          disabled={isLoading || searchingLive}
        >
          {isLoading || searchingLive ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />} {isLoading || searchingLive ? t('loading') : t('searchLive')}
        </button>
        {token && (
          <button
            onClick={recommendFromCv}
            disabled={recommending}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand-soft)] disabled:opacity-60"
          >
            {recommending ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />} {recommending ? 'Analyse…' : 'Recommandé pour mon CV'}
          </button>
        )}
        <button type="button" onClick={clearSearch} className="clear-button">{t('clear')}</button>
        <label className="country-select ml-auto"><SlidersHorizontal size={14} /><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={t('sortBy')}><option value="recent">{t('sortRecent')}</option><option value="match">{t('sortMatch')}</option><option value="visa">{t('sortVisa')}</option></select></label>
        {notice && <span className="text-sm text-gray-600">{notice}</span>}
        </div>
      </div>

      {isLoading && <p>{t('loading')}</p>}
      {!token && (
        <p className="mb-4 text-sm text-gray-500">
          {t('signInToScores')}
        </p>
      )}

      {sortedJobs.length > 0 && <p className="mb-3 text-sm font-semibold text-[var(--muted)]"><strong className="text-[var(--ink)]">{sortedJobs.length}</strong> {sortedJobs.length > 1 ? t('resultsMany') : t('resultsOne')}</p>}
      <div className="space-y-4">
        {sortedJobs.map((job) => (
          <JobCard key={job.id} job={job} token={token} onNotice={setNotice} />
        ))}
        {data?.length === 0 && (
          <div className="search-empty"><div className="empty-icon"><Search size={22} /></div><h2>{t('noJobs')}</h2><p>Les sources automatiques n’ont rien retourné pour l’instant. Continuez avec une recherche directe :</p><div className="external-search-grid">{externalSearches.map(([label, url, caption]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="external-search-card"><strong>{label}</strong><span>{caption}</span><ExternalLink size={14} /></a>)}</div></div>
        )}
      </div>
    </main></>
  );
}

function JobCard({ job, token, onNotice }: { job: Job; token: string | null; onNotice: (message: string) => void }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cardError, setCardError] = useState('');

  const description = cleanText(job.description);
  const requirements = extractRequirements(description);
  const email = extractEmail(description);
  const applyHref = job.applyUrl ?? job.url;
  const postedLabel = job.postedAt
    ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(job.postedAt))
    : '';

  async function generateCv() {
    if (!token) {
      setCardError(t('signInToGenerate'));
      return;
    }
    setGenerating(true);
    setCardError('');
    try {
      const doc = await api<{ id: string }>('/generation/resume', {
        method: 'POST',
        body: JSON.stringify({ jobId: job.id }),
      });
      const blob = await downloadApi(`/generation/${doc.id}/download`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `CV-${job.company}.pdf`.replace(/\s+/g, '-');
      anchor.click();
      URL.revokeObjectURL(url);
      onNotice(t('cvReady'));
    } catch (err) {
      const message = (err as Error).message;
      setCardError(/primary CV|Upload a primary/i.test(message) ? t('needPrimaryCv') : message);
    } finally {
      setGenerating(false);
    }
  }

  async function saveJob() {
    try {
      await api('/applications', { method: 'POST', body: JSON.stringify({ jobId: job.id }) });
      onNotice(t('savedApplication'));
    } catch (err) {
      setCardError((err as Error).message);
    }
  }

  return (
    <article className="job-card rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:border-[var(--brand)] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--ink)]">{job.title}</h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[var(--muted)]">
            <span className="font-medium text-[var(--ink)]">{formatCompany(job.company)}</span>
            {job.location && <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
            {postedLabel && <span>· {postedLabel}</span>}
          </p>
        </div>
        {typeof job.matchScore === 'number' && (
          <div className="match-ring" style={{ ['--score' as string]: job.matchScore }} title={`${job.matchScore}% ${t('sortMatch')}`}>
            <span>{job.matchScore}%</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {job.source && <Badge>{formatSource(job.source)}</Badge>}
        {job.remote && <Badge>{t('remoteBadge')}</Badge>}
        {job.hasVisaSponsorship && <Badge className="bg-emerald-50 text-emerald-700">{t('visaBadge')}</Badge>}
        {job.relocationSupport && <Badge>{t('relocationBadge')}</Badge>}
        {job.salaryMax ? <Badge>{job.currency ?? '$'} {job.salaryMin ?? '?'}–{job.salaryMax}</Badge> : null}
      </div>

      {job.description && (
        <p className="job-description mt-4">{description.slice(0, 240)}{description.length > 240 ? '…' : ''}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={generateCv} disabled={generating} className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60">
          {generating ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />} {generating ? t('generatingCv') : t('generateCvForJob')}
        </button>
        <a href={applyHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3.5 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]">
          {t('apply')} <ExternalLink size={14} />
        </a>
        {token && (
          <button onClick={saveJob} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--brand)]">
            <Bookmark size={14} /> {t('saveApplication')}
          </button>
        )}
        <button onClick={() => setExpanded((v) => !v)} className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)]">
          {expanded ? t('hideDetails') : t('viewDetails')} <ChevronDown size={15} className={`transition ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {cardError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{cardError}</p>}

      {expanded && (
        <div className="mt-5 grid gap-5 border-t border-[var(--line)] pt-5 md:grid-cols-2">
          <div>
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]"><ListChecks size={15} className="text-[var(--brand)]" /> {t('requirements')}</h4>
            {requirements.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted)]">
                {requirements.map((req, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--brand)]" /> {req}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">{t('detailsOnEmployer')}</p>
            )}
          </div>
          <div className="space-y-4">
            {job.matchReasons && job.matchReasons.length > 0 && (
              <div>
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]"><Target size={15} className="text-[var(--brand)]" /> {t('matchReasonsLabel')}</h4>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {job.matchReasons.map((reason, i) => <li key={i} className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-medium text-[var(--brand-dark)]">{reason}</li>)}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(`Application — ${job.title}`)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]">
                  <Mail size={14} /> {t('applyByEmail')}
                </a>
              )}
              <a href={applyHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]">
                <FileText size={14} /> {t('applyEmployer')}
              </a>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function extractRequirements(description?: string): string[] {
  if (!description) return [];
  const parts = description
    .split(/\r?\n|•|\u2022|·|;|\.\s/)
    .map((line) => line.replace(/^[\s\-*–>●]+/, '').trim());
  const pattern = /(experience|years?|proficien|knowledge|degree|skills?|familiar|expert|understanding|ability|required|must have|strong|fluent|ann[ée]es|exp[ée]rience|ma[îi]trise|comp[ée]tences|dipl[ôo]me|conna[îi]ssance|ma[îi]trisez)/i;
  const seen = new Set<string>();
  const results: string[] = [];
  for (const part of parts) {
    if (part.length < 20 || part.length > 180) continue;
    if (!pattern.test(part)) continue;
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(part);
    if (results.length >= 6) break;
  }
  return results;
}

function extractEmail(description?: string): string | null {
  if (!description) return null;
  const match = description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

/** Safety net for records saved before the server-side HTML fix: decode entities and drop any leftover tags. */
function cleanText(input?: string): string {
  if (!input) return '';
  let text = input;
  for (let pass = 0; pass < 2; pass++) {
    text = decodeEntities(text)
      .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ');
  }
  return text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => fromCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => fromCode(Number(dec)))
    .replace(/&amp;/gi, '&');
}

function fromCode(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

/** Board tokens are stored lowercase (e.g. "gitlab"); present them nicely. */
function formatCompany(company?: string): string {
  if (!company) return '';
  if (/\s/.test(company)) return company;
  return company
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Turn a source enum (GREENHOUSE, THEMUSE) into a readable label. */
function formatSource(source: string): string {
  const labels: Record<string, string> = {
    GREENHOUSE: 'Greenhouse',
    LEVER: 'Lever',
    REMOTIVE: 'Remotive',
    THEMUSE: 'The Muse',
    ADZUNA: 'Adzuna',
    JSEARCH: 'Google Jobs',
  };
  return labels[source] ?? source.charAt(0) + source.slice(1).toLowerCase();
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full bg-[var(--brand-soft)] px-2.5 py-1 font-medium text-[var(--brand-dark)] ${className}`}>
      {children}
    </span>
  );
}
