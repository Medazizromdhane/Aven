'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { AppHeader } from '@/components/app-header';
import { Bookmark, ExternalLink, LoaderCircle, Search, SlidersHorizontal } from 'lucide-react';

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
}

export default function JobsPage() {
  const { token, hydrate } = useAuth();
  const [visaOnly, setVisaOnly] = useState(false);
  const [remote, setRemote] = useState(false);
  const [country, setCountry] = useState('');
  const [tech, setTech] = useState('');
  const [notice, setNotice] = useState('');

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
    setNotice('Searching live job sources…');
    try {
      await api('/jobs/search', {
        method: 'POST',
        body: JSON.stringify({
          keywords: tech ? [tech] : ['software engineer'],
          countries: country ? [country] : [],
        }),
      });
      await refetch();
      setNotice('Live sources searched. Results are updated.');
    } catch (err) {
      setNotice((err as Error).message);
    }
  }

  return (
    <><AppHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-7"><p className="eyebrow">The opportunity desk</p><h1 className="display-type mt-2 text-4xl">Find your next place.</h1><p className="mt-2 max-w-xl text-[var(--muted)]">Roles with a clearer path to sponsorship, relocation, and a future you can picture.</p></header>

      <div className="mb-8 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]"><SlidersHorizontal size={16} className="text-[var(--brand)]" /> Refine your search</div><div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="field"
        />
        <input
          placeholder="Technology"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          className="field"
        />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
          Remote
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={visaOnly}
            onChange={(e) => setVisaOnly(e.target.checked)}
          />
          Visa sponsorship only
        </label>
        <button
          onClick={searchJobs}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? <LoaderCircle size={15} className="animate-spin" /> : <Search size={15} />} Search live jobs
        </button>
        {notice && <span className="text-sm text-gray-600">{notice}</span>}
        </div>
      </div>

      {isLoading && <p>Loading jobs…</p>}
      {!token && (
        <p className="mb-4 text-sm text-gray-500">
          Log in to see personalized match scores.
        </p>
      )}

      <div className="space-y-3">
        {data?.map((job) => (
          <div key={job.id} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[var(--ink)]">{job.title}</h3>
                <p className="text-sm text-[var(--muted)]">
                  {job.company} {job.location ? `· ${job.location}` : ''}
                </p>
              </div>
              {typeof job.matchScore === 'number' && (
                <span className="rounded-full bg-[#e7f2eb] px-3 py-1 text-sm font-semibold text-[var(--brand-dark)]">
                  {job.matchScore}% match
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {job.remote && <Badge>Remote</Badge>}
              {job.hasVisaSponsorship && <Badge className="bg-green-100 text-green-700">Visa sponsorship</Badge>}
              {job.relocationSupport && <Badge>Relocation</Badge>}
              {job.salaryMax ? (
                <Badge>
                  {job.currency ?? '$'} {job.salaryMin ?? '?'}–{job.salaryMax}
                </Badge>
              ) : null}
            </div>
            <a
              href={job.applyUrl ?? job.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
            >
              Apply on employer site <ExternalLink size={14} />
            </a>
            {token && (
              <button
                onClick={async () => {
                  try {
                    await api('/applications', {
                      method: 'POST',
                      body: JSON.stringify({ jobId: job.id }),
                    });
                    setNotice('Job saved to your application tracker.');
                  } catch (err) {
                    setNotice((err as Error).message);
                  }
                }}
                className="ml-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
              >
                <Bookmark size={14} /> Save application
              </button>
            )}
          </div>
        ))}
        {data?.length === 0 && (
          <p className="text-gray-500">No jobs yet. Trigger a search from the API or wait for the daily hunt.</p>
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
