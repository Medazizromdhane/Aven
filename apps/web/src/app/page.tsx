'use client';

import Link from 'next/link';
import { ArrowRight, FileText, FileUp, Globe2, ScanSearch, Send, Sparkles } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useLanguage();

  const steps = [
    [<FileUp size={20} key="1" />, t('step1Title'), t('step1Copy')],
    [<ScanSearch size={20} key="2" />, t('step2Title'), t('step2Copy')],
    [<Sparkles size={20} key="3" />, t('step3Title'), t('step3Copy')],
    [<Send size={20} key="4" />, t('step4Title'), t('step4Copy')],
  ] as const;

  const stats = [
    [t('statRoles'), t('statRolesLabel')],
    [t('statCountries'), t('statCountriesLabel')],
    [t('statVisa'), t('statVisaLabel')],
    [t('statTailored'), t('statTailoredLabel')],
  ] as const;

  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#0b0918] text-[#f4f2fb]">
      <nav className="landing-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="landing-brand"><Logo />aven</Link>
          <div className="hidden items-center gap-7 text-sm text-[#a5a1c4] lg:flex">
            <a href="#how" className="transition hover:text-white">{t('navHow')}</a>
            <a href="#features" className="transition hover:text-white">{t('navFeatures')}</a>
            <Link href="/jobs" className="transition hover:text-white">{t('navExploreJobs')}</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher dark />
            <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-[#c4c0dc] transition hover:text-white sm:block">{t('login')}</Link>
            <Link href="/register" className="accent-button text-sm">{t('signup')} <ArrowRight size={15} /></Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-aurora" />
        <div className="landing-noise" />
        <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <p className="hero-pill reveal-up"><span className="dot" /> {t('globalCareer')}</p>
            <h1 className="landing-title reveal-up d1 mt-7 max-w-4xl">{t('heroTitle')}</h1>
            <p className="reveal-up d2 mt-7 max-w-xl text-lg leading-8 text-[#a5a1c4]">{t('heroCopy')}</p>
            <div className="reveal-up d3 mt-9 flex flex-wrap items-center gap-4">
              <Link href="/register" className="accent-button">{t('startSearch')} <ArrowRight size={17} /></Link>
              <Link href="/jobs" className="ghost-button">{t('exploreRoles')}</Link>
            </div>
            <div className="reveal-up d4 mt-10 max-w-md">
              <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-[#8a86a8]"><span className="h-1.5 w-1.5 rounded-full bg-[#8b7bff]" /> {t('trustedBy')}</p>
              <div className="marquee">
                <div className="marquee-track">
                  {['Greenhouse', 'Lever', 'Remotive', 'The Muse', 'Adzuna', 'Google Jobs', 'Greenhouse', 'Lever', 'Remotive', 'The Muse', 'Adzuna', 'Google Jobs'].map((name, i) => (
                    <span key={i}>{name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="landing-visual hero-visual-float relative min-h-[430px] p-4 sm:min-h-[510px] sm:p-7">
            <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
            <div className="relative flex h-full flex-col justify-between rounded-[1.4rem] border border-white/10 bg-[#171233]/90 p-5 shadow-2xl backdrop-blur sm:p-7">
              <div className="flex items-center justify-between"><span className="text-sm font-bold">{t('opportunityMap')}</span><span className="rounded-full border border-[#8b7bff]/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#b7a6ff]">{t('live')}</span></div>
              <div className="space-y-3 py-8"><Opportunity icon={<Globe2 size={18} />} title={t('visaRoles')} value={t('newThisWeek')} /><Opportunity icon={<ScanSearch size={18} />} title={t('strongestFit')} value="Product engineering · 92%" /><Opportunity icon={<FileText size={18} />} title={t('applicationReady')} value={t('resumeCover')} /></div>
              <div className="rounded-xl bg-gradient-to-br from-[#6d5efc] to-[#a95bff] p-4 text-white"><p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">{t('nextBestMove')}</p><p className="mt-2 font-bold">{t('refineProfile')}</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full w-[72%] rounded-full bg-white" /></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat band */}
      <section className="landing-section bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="stat-band">
            {stats.map(([figure, label]) => (
              <div key={label}>
                <p className="stat-figure">{figure}</p>
                <p className="mt-2 text-sm text-[#8f8bb0]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="landing-section">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <p className="section-label" style={{ color: '#b7a6ff' }}>{t('howItWorks')}</p>
          <h2 className="landing-title mt-5 max-w-2xl" style={{ fontSize: 'clamp(2.2rem,4.5vw,3.4rem)' }}>{t('howCopy')}</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(([icon, title, copy], i) => (
              <div key={title} className="step-card">
                <div className="mb-5 flex items-center justify-between">
                  <span className="step-index">{i + 1}</span>
                  <span className="text-[#b7a6ff]">{icon}</span>
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#8f8bb0]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="landing-section bg-[#100c22]"><div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3">{[[Globe2, t('featureHorizon'), t('featureHorizonCopy')], [ScanSearch, t('featureFit'), t('featureFitCopy')], [FileText, t('featureReady'), t('featureReadyCopy')]].map(([Icon, title, desc], index) => <div key={title as string} className="border-b border-white/10 px-1 py-9 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><p className="mb-5 text-xs font-bold text-[#6f6a90]">0{index + 1}</p><div className="mb-4 text-[#b7a6ff]"><Icon size={20} /></div><h2 className="font-semibold">{title as string}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-[#8f8bb0]">{desc as string}</p></div>)}</div></section>

      {/* Testimonial */}
      <section className="landing-section">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <div className="quote-card">
            <p className="text-2xl leading-relaxed" style={{ fontFamily: 'var(--font-display)' }}>{t('quoteText')}</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#6d5efc] to-[#a95bff] font-bold text-white">A</span>
              <span>
                <span className="block text-sm font-semibold">{t('quoteAuthor')}</span>
                <span className="block text-xs text-[#8f8bb0]">{t('quoteRole')}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-section">
        <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <div className="cta-panel px-6 py-16 text-center sm:px-16">
            <h2 className="landing-title mx-auto max-w-3xl" style={{ fontSize: 'clamp(2.4rem,5vw,4rem)' }}>{t('ctaTitle')}</h2>
            <p className="mx-auto mt-6 max-w-xl text-[#a5a1c4]">{t('ctaCopy')}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/register" className="accent-button">{t('ctaButton')} <ArrowRight size={17} /></Link>
              <Link href="/login" className="ghost-button">{t('login')}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Logo() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-[0.7rem] bg-gradient-to-br from-[#6d5efc] to-[#a95bff] text-white" aria-hidden>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5 20.5 20h-4.2l-1.6-3.4H9.3L7.7 20H3.5L12 3.5Zm0 7-1.9 4h3.8L12 10.5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

function Opportunity({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#8b7bff]/15 text-[#b7a6ff]">{icon}</span><span><span className="block text-xs text-[#8f8bb0]">{title}</span><span className="text-sm font-semibold">{value}</span></span></div>;
}
