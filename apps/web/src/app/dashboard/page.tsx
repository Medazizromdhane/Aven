'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BriefcaseBusiness, Building2, FileText, Globe2, Radar, ScanSearch, Sparkles, Target, TrendingUp, UserRound } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { AppHeader } from '@/components/app-header';
import { useLanguage } from '@/lib/i18n';

interface Overview { jobsDetected: number; jobsWithVisa: number; averageScore: number; applications: Record<string, number>; conversion: { applied: number; interviewRate: number; offerRate: number }; byCountry: { country: string; count: number }[]; byCompany: { company: string; count: number }[]; }

export default function DashboardPage() {
  const router = useRouter();
  const { token, hydrate } = useAuth();
  const { t } = useLanguage();
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (token === null && typeof window !== 'undefined' && !localStorage.getItem('vh_token')) router.push('/login'); }, [token, router]);
  const { data, isLoading, error } = useQuery({ queryKey: ['dashboard'], queryFn: () => api<Overview>('/dashboard'), enabled: Boolean(token) });
  const profileProgress = data ? Math.min(100, data.jobsDetected > 0 ? 72 : 28) : 0;

  return <><AppHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
    <header className="page-hero mb-8 flex flex-wrap items-end justify-between gap-6">
      <div><p className="eyebrow">{t('commandCenter')}</p><h1 className="mt-2 text-4xl sm:text-5xl">{t('greeting')}</h1><p className="hero-copy mt-3 max-w-xl">{t('dashboardCopy')}</p></div>
      <div className="flex flex-wrap gap-3">
        <Link href="/workspace" className="hero-ghost-btn"><UserRound size={16} /> {t('workspace')}</Link>
        <Link href="/jobs" className="hero-solid-btn"><Radar size={16} /> {t('exploreJobs')} <ArrowRight size={16} /></Link>
      </div>
    </header>
    {isLoading && <LoadingState label={t('loading')} />}
    {error && <div className="notice-error">{(error as Error).message}</div>}
    {data && <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<BriefcaseBusiness size={18} />} label={t('jobsDetected')} value={data.jobsDetected} accent="mint" />
        <Stat icon={<Globe2 size={18} />} label={t('visaSponsorship')} value={data.jobsWithVisa} accent="lavender" />
        <Stat icon={<Target size={18} />} label={t('averageScore')} value={`${data.averageScore}%`} accent="peach" />
        <Stat icon={<TrendingUp size={18} />} label={t('applicationsSent')} value={data.conversion.applied} accent="blue" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="dashboard-feature lg:col-span-2">
          <div><span className="soft-badge"><Sparkles size={13} /> {t('insight')}</span><h2 className="mt-4 max-w-lg text-2xl font-semibold">{data.jobsDetected ? t('momentum') : t('buildProfile')}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">{data.jobsDetected ? t('keepExploring') : t('buildProfileCopy')}</p></div>
          <div className="mt-7 flex items-end justify-between gap-5"><div className="progress-track"><div className="progress-value" style={{ width: `${profileProgress}%` }} /></div><span className="text-sm font-bold text-[var(--brand)]">{profileProgress}%</span></div>
          <Link href="/workspace" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">{t('completeProfile')} <ArrowRight size={15} /></Link>
        </div>
        <div className="space-y-3">
          <p className="eyebrow">{t('quickActions')}</p>
          <QuickAction href="/jobs" icon={<ScanSearch size={18} />} title={t('qaSearch')} copy={t('qaSearchCopy')} />
          <QuickAction href="/workspace" icon={<UserRound size={18} />} title={t('qaProfile')} copy={t('qaProfileCopy')} />
          <QuickAction href="/workspace" icon={<FileText size={18} />} title={t('qaDocs')} copy={t('qaDocsCopy')} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Panel title={t('applicationFunnel')} icon={<TrendingUp size={17} />}>
          <div className="space-y-3">{Object.entries(data.applications).map(([key, value]) => <FunnelRow key={key} label={t(key) === key ? key : t(key)} value={value} total={Math.max(1, data.conversion.applied)} />)}</div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-sm"><span className="text-[var(--muted)]">{t('interviewRate')} <strong className="ml-1 text-[var(--ink)]">{data.conversion.interviewRate}%</strong></span><span className="text-right text-[var(--muted)]">{t('offerRate')} <strong className="ml-1 text-[var(--ink)]">{data.conversion.offerRate}%</strong></span></div>
        </Panel>
        <Panel title={t('topCountries')} icon={<Globe2 size={17} />}>
          <div className="space-y-4">{data.byCountry.slice(0, 5).map((country, index) => <RankRow key={country.country} index={index} label={country.country} count={country.count} />)}{data.byCountry.length === 0 && <Empty icon={<Globe2 size={22} />} label={t('noData')} />}</div>
        </Panel>
        <Panel title={t('topCompanies')} icon={<Building2 size={17} />}>
          <div className="space-y-4">{data.byCompany.slice(0, 5).map((company, index) => <RankRow key={company.company} index={index} label={company.company} count={company.count} />)}{data.byCompany.length === 0 && <Empty icon={<Building2 size={22} />} label={t('noData')} />}</div>
        </Panel>
      </section>

      <section className="dashboard-panel">
        <h2 className="flex items-center gap-2 font-semibold"><FileText size={17} className="text-[var(--brand)]" /> {t('recentActivity')}</h2>
        <div className="mt-5 flex min-h-24 items-center justify-center text-center text-sm leading-6 text-[var(--muted)]">{data.conversion.applied > 0 ? `${data.conversion.applied} ${t('applicationsSent').toLowerCase()}` : t('noActivity')}</div>
      </section>
    </div>}
  </main></>;
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) { return <div className={`stat-card stat-${accent}`}><span className="stat-icon">{icon}</span><div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-sm text-[var(--muted)]">{label}</div></div>; }
function QuickAction({ href, icon, title, copy }: { href: string; icon: React.ReactNode; title: string; copy: string }) { return <Link href={href} className="quick-action"><span className="quick-action-icon">{icon}</span><span className="min-w-0"><span className="block font-semibold text-[var(--ink)]">{title}</span><span className="mt-0.5 block text-xs leading-5 text-[var(--muted)]">{copy}</span></span><ArrowRight size={16} className="ml-auto mt-1 shrink-0 text-[var(--muted)]" /></Link>; }
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <div className="dashboard-panel"><h2 className="flex items-center gap-2 font-semibold"><span className="text-[var(--brand)]">{icon}</span>{title}</h2><div className="mt-5">{children}</div></div>; }
function FunnelRow({ label, value, total }: { label: string; value: number; total: number }) { return <div><div className="mb-1.5 flex justify-between text-sm"><span className="capitalize text-[var(--muted)]">{label}</span><strong>{value}</strong></div><div className="funnel-track"><span style={{ width: `${Math.min(100, value / total * 100)}%` }} /></div></div>; }
function RankRow({ index, label, count }: { index: number; label: string; count: number }) { return <div className="flex items-center gap-3"><span className="country-rank">0{index + 1}</span><span className="flex-1 truncate text-sm font-semibold">{label}</span><span className="text-sm text-[var(--muted)]">{count}</span><span className="country-bar"><span style={{ width: `${Math.min(100, count * 12)}%` }} /></span></div>; }
function Empty({ icon, label }: { icon: React.ReactNode; label: string }) { return <div className="empty-state"><span>{icon}</span><p>{label}</p></div>; }
function LoadingState({ label }: { label: string }) { return <div className="empty-state min-h-60"><span className="animate-pulse"><UserRound size={25} /></span><p>{label}</p></div>; }
