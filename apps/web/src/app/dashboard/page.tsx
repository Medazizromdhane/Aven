'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BriefcaseBusiness, FileText, Globe2, Radar, Sparkles, Target, TrendingUp, UserRound } from 'lucide-react';
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

  return <><AppHeader /><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
    <header className="dashboard-hero mb-8 flex flex-wrap items-end justify-between gap-6">
      <div><p className="eyebrow">{t('commandCenter')}</p><h1 className="display-type mt-2 text-5xl">{t('greeting')}</h1><p className="mt-3 max-w-xl text-[var(--muted)]">{t('dashboardCopy')}</p></div>
      <Link href="/jobs" className="primary-action"><Radar size={16} /> {t('exploreJobs')} <ArrowRight size={16} /></Link>
    </header>
    {isLoading && <LoadingState label={t('loading')} />}
    {error && <div className="notice-error">{(error as Error).message}</div>}
    {data && <>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<BriefcaseBusiness size={18} />} label={t('jobsDetected')} value={data.jobsDetected} accent="mint" />
        <Stat icon={<Globe2 size={18} />} label={t('visaSponsorship')} value={data.jobsWithVisa} accent="lavender" />
        <Stat icon={<Target size={18} />} label={t('averageScore')} value={`${data.averageScore}%`} accent="peach" />
        <Stat icon={<TrendingUp size={18} />} label={t('applicationsSent')} value={data.conversion.applied} accent="blue" />
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
        <div className="dashboard-feature"><div><span className="soft-badge"><Sparkles size={13} /> {t('insight')}</span><h2 className="mt-4 max-w-lg text-2xl font-semibold">{data.jobsDetected ? t('momentum') : t('buildProfile')}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">{data.jobsDetected ? t('keepExploring') : t('buildProfileCopy')}</p></div><div className="mt-7 flex items-end justify-between gap-5"><div className="progress-track"><div className="progress-value" style={{ width: `${profileProgress}%` }} /></div><span className="text-sm font-bold text-[var(--brand)]">{profileProgress}%</span></div><Link href="/workspace" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">{t('completeProfile')} <ArrowRight size={15} /></Link></div>
        <div className="dashboard-mini"><div className="flex items-center justify-between"><h2 className="font-semibold">{t('recentActivity')}</h2><FileText size={18} className="text-[var(--brand)]" /></div><div className="mt-5 flex min-h-28 items-center justify-center text-center text-sm leading-6 text-[var(--muted)]">{data.conversion.applied > 0 ? `${data.conversion.applied} ${t('applicationsSent').toLowerCase()}` : t('noActivity')}</div></div>
      </section>
      <section className="mt-5 grid gap-5 lg:grid-cols-2"><Panel title={t('applicationFunnel')} icon={<TrendingUp size={17} />}><div className="space-y-3">{Object.entries(data.applications).map(([key, value]) => <FunnelRow key={key} label={t(key) === key ? key : t(key)} value={value} total={Math.max(1, data.conversion.applied)} />)}</div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-sm"><span className="text-[var(--muted)]">{t('interviewRate')} <strong className="ml-1 text-[var(--ink)]">{data.conversion.interviewRate}%</strong></span><span className="text-right text-[var(--muted)]">{t('offerRate')} <strong className="ml-1 text-[var(--ink)]">{data.conversion.offerRate}%</strong></span></div></Panel><Panel title={t('topCountries')} icon={<Globe2 size={17} />}><div className="space-y-4">{data.byCountry.slice(0, 5).map((country, index) => <div key={country.country} className="flex items-center gap-3"><span className="country-rank">0{index + 1}</span><span className="flex-1 text-sm font-semibold">{country.country}</span><span className="text-sm text-[var(--muted)]">{country.count}</span><span className="country-bar"><span style={{ width: `${Math.min(100, country.count * 12)}%` }} /></span></div>)}{data.byCountry.length === 0 && <Empty icon={<Globe2 size={22} />} label={t('noData')} />}</div></Panel></section>
    </>}
  </main></>;
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number | string; accent: string }) { return <div className={`stat-card stat-${accent}`}><span className="stat-icon">{icon}</span><div className="mt-5 text-3xl font-semibold tracking-tight">{value}</div><div className="mt-1 text-sm text-[var(--muted)]">{label}</div></div>; }
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <div className="dashboard-panel"><h2 className="flex items-center gap-2 font-semibold"><span className="text-[var(--brand)]">{icon}</span>{title}</h2><div className="mt-5">{children}</div></div>; }
function FunnelRow({ label, value, total }: { label: string; value: number; total: number }) { return <div><div className="mb-1.5 flex justify-between text-sm"><span className="capitalize text-[var(--muted)]">{label}</span><strong>{value}</strong></div><div className="funnel-track"><span style={{ width: `${Math.min(100, value / total * 100)}%` }} /></div></div>; }
function Empty({ icon, label }: { icon: React.ReactNode; label: string }) { return <div className="empty-state"><span>{icon}</span><p>{label}</p></div>; }
function LoadingState({ label }: { label: string }) { return <div className="empty-state min-h-60"><span className="animate-pulse"><UserRound size={25} /></span><p>{label}</p></div>; }
