import Link from 'next/link';
import { ArrowRight, FileText, Globe2, ScanSearch, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[#111310] text-[#f4f4ed]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <span className="landing-brand"><span className="landing-brand-mark"><Sparkles size={15} /></span>aven</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-[#c2c8bd] transition hover:text-white sm:block">Log in</Link>
          <Link href="/register" className="rounded-full bg-[#c8f169] px-4 py-2.5 text-sm font-bold text-[#182013] transition hover:bg-[#d8ff86]">Get started <ArrowRight className="ml-1 inline" size={15} /></Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-24">
        <div>
          <p className="landing-kicker"><span className="h-1.5 w-1.5 rounded-full bg-[#c8f169]" /> The global career platform</p>
          <h1 className="landing-title mt-7 max-w-4xl">The right move is <em>out there.</em></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#aeb6aa]">Find roles built for global talent, understand your fit, and make every application feel like a step forward.</p>
          <div className="mt-9 flex flex-wrap items-center gap-5"><Link href="/register" className="rounded-full bg-[#c8f169] px-6 py-3.5 font-bold text-[#182013] transition hover:-translate-y-0.5 hover:bg-[#d8ff86]">Start your search <ArrowRight className="ml-2 inline" size={17} /></Link><Link href="/jobs" className="font-semibold text-[#d9dfd5] transition hover:text-[#c8f169]">Explore roles <span className="ml-1">↗</span></Link></div>
        </div>
        <div className="landing-visual relative min-h-[430px] p-4 sm:min-h-[510px] sm:p-7">
          <div className="landing-orbit landing-orbit-one" /><div className="landing-orbit landing-orbit-two" />
          <div className="relative flex h-full flex-col justify-between rounded-[1.4rem] border border-white/10 bg-[#1b1e19]/90 p-5 shadow-2xl backdrop-blur sm:p-7">
            <div className="flex items-center justify-between"><span className="text-sm font-bold">Your opportunity map</span><span className="rounded-full border border-[#c8f169]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8f169]">Live</span></div>
            <div className="space-y-3 py-8"><Opportunity icon={<Globe2 size={18} />} title="Visa-friendly roles" value="142 new this week" /><Opportunity icon={<ScanSearch size={18} />} title="Your strongest fit" value="Product engineering · 92%" /><Opportunity icon={<FileText size={18} />} title="Application ready" value="Resume + cover letter" /></div>
            <div className="rounded-xl bg-[#c8f169] p-4 text-[#182013]"><p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-65">Next best move</p><p className="mt-2 font-bold">Refine your profile to unlock better matches.</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/15"><div className="h-full w-[72%] rounded-full bg-[#38512b]" /></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#181a17]"><div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3">{[[Globe2, 'Find your horizon', 'Search international roles filtered for sponsorship and relocation.'], [ScanSearch, 'Know your fit', 'A grounded match score that shows what makes you stand out.'], [FileText, 'Show up ready', 'Generate truthful, tailored documents from your real experience.']].map(([Icon, title, desc], index) => <div key={title as string} className="border-b border-white/10 px-1 py-9 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><p className="mb-5 text-xs font-bold text-[#697465]">0{index + 1}</p><div className="mb-4 text-[#c8f169]"><Icon size={20} /></div><h2 className="font-semibold">{title as string}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-[#929b90]">{desc as string}</p></div>)}</div></section>
    </main>
  );
}

function Opportunity({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#c8f169]/10 text-[#c8f169]">{icon}</span><span><span className="block text-xs text-[#899288]">{title}</span><span className="text-sm font-semibold">{value}</span></span></div>;
}
