'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { AppHeader } from '@/components/app-header';
import { Bookmark, ExternalLink, Globe2, LoaderCircle, Search, SlidersHorizontal } from 'lucide-react';
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
      <header className="mb-7"><p className="eyebrow">{t('searchDesk')}</p><h1 className="display-type mt-2 text-4xl">{t('findPlace')}</h1><p className="mt-2 max-w-xl text-[var(--muted)]">{t('jobsCopy')}</p></header>

      <div className="mb-8 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
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
        <button type="button" onClick={clearSearch} className="clear-button">Effacer</button>
        {notice && <span className="text-sm text-gray-600">{notice}</span>}
        </div>
      </div>

      {isLoading && <p>{t('loading')}</p>}
      {!token && (
        <p className="mb-4 text-sm text-gray-500">
          {t('signInToScores')}
        </p>
      )}

      {data && data.length > 0 && <p className="mb-3 text-sm font-semibold text-[var(--muted)]"><strong className="text-[var(--ink)]">{data.length}</strong> résultat{data.length > 1 ? 's' : ''} correspondant à votre recherche</p>}
      <div className="space-y-3">
        {data?.map((job) => (
          <article key={job.id} className="job-card rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">{job.title}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {job.company} {job.location ? `· ${job.location}` : ''} {job.postedAt ? `· ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(job.postedAt))}` : ''}
                </p>
              </div>
              {typeof job.matchScore === 'number' && (
                <span className="rounded-full bg-[#e7f2eb] px-3 py-1 text-sm font-semibold text-[var(--brand-dark)]">
                  {job.matchScore}% match
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {job.source && <Badge>{job.source}</Badge>}
              {job.remote && <Badge>{t('remoteBadge')}</Badge>}
              {job.hasVisaSponsorship && <Badge className="bg-green-100 text-green-700">{t('visaBadge')}</Badge>}
              {job.relocationSupport && <Badge>{t('relocationBadge')}</Badge>}
              {job.salaryMax ? (
                <Badge>
                  {job.currency ?? '$'} {job.salaryMin ?? '?'}–{job.salaryMax}
                </Badge>
              ) : null}
            </div>
            {job.description && <p className="job-description mt-4">{job.description.slice(0, 280)}{job.description.length > 280 ? '…' : ''}</p>}
            <a
              href={job.applyUrl ?? job.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              {t('applyEmployer')} <ExternalLink size={14} />
            </a>
            {token && (
              <button
                onClick={async () => {
                  try {
                    await api('/applications', {
                      method: 'POST',
                      body: JSON.stringify({ jobId: job.id }),
                    });
                    setNotice(t('savedApplication'));
                  } catch (err) {
                    setNotice((err as Error).message);
                  }
                }}
                className="ml-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
              >
                <Bookmark size={14} /> {t('saveApplication')}
              </button>
            )}
          </article>
        ))}
        {data?.length === 0 && (
          <div className="search-empty"><div className="empty-icon"><Search size={22} /></div><h2>{t('noJobs')}</h2><p>Les sources automatiques n’ont rien retourné pour l’instant. Continuez avec une recherche directe :</p><div className="external-search-grid">{externalSearches.map(([label, url, caption]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="external-search-card"><strong>{label}</strong><span>{caption}</span><ExternalLink size={14} /></a>)}</div></div>
        )}
      </div>
    </main></>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700 ${className}`}>
      {children}
    </span>
  );
}
