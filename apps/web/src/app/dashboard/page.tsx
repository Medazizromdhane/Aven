'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { AppHeader } from '@/components/app-header';

interface Overview {
  jobsDetected: number;
  jobsWithVisa: number;
  averageScore: number;
  applications: Record<string, number>;
  conversion: { applied: number; interviewRate: number; offerRate: number };
  byCountry: { country: string; count: number }[];
  byCompany: { company: string; count: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, hydrate } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (token === null && typeof window !== 'undefined' && !localStorage.getItem('vh_token')) {
      router.push('/login');
    }
  }, [token, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Overview>('/dashboard'),
    enabled: Boolean(token),
  });

  return (
    <><AppHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Your command center</p><h1 className="display-type mt-2 text-4xl">Good to see you.</h1><p className="mt-2 text-[var(--muted)]">Keep the momentum moving toward your next opportunity.</p></div>
        <Link href="/jobs" className="inline-flex items-center rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white">Explore jobs</Link>
      </header>

      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-600">{(error as Error).message}</p>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Jobs detected" value={data.jobsDetected} />
            <Stat label="With visa sponsorship" value={data.jobsWithVisa} />
            <Stat label="Avg. match score" value={`${data.averageScore}`} />
            <Stat label="Applications sent" value={data.conversion.applied} />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card title="Application funnel">
              <ul className="space-y-1 text-sm">
                {Object.entries(data.applications).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="capitalize">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-sm text-gray-600">
                Interview rate: {data.conversion.interviewRate}% · Offer rate:{' '}
                {data.conversion.offerRate}%
              </div>
            </Card>

            <Card title="Top countries">
              <ul className="space-y-1 text-sm">
                {data.byCountry.map((c) => (
                  <li key={c.country} className="flex justify-between">
                    <span>{c.country}</span>
                    <span className="font-semibold">{c.count}</span>
                  </li>
                ))}
                {data.byCountry.length === 0 && <li className="text-gray-500">No data yet</li>}
              </ul>
            </Card>
          </div>
        </>
      )}
    </main></>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
      <div className="text-3xl font-bold text-[var(--brand)]">{value}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-[var(--ink)]">{title}</h2>
      {children}
    </div>
  );
}
