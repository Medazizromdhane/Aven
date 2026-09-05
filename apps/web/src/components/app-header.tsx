'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseBusiness,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { useLanguage } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';

export function AppHeader() {
  const pathname = usePathname();
  const logout = useAuth((state) => state.logout);
  const { t } = useLanguage();
  const links = [
    { href: '/dashboard', label: t('overview'), icon: LayoutDashboard },
    { href: '/jobs', label: t('exploreJobs'), icon: Compass },
    { href: '/workspace', label: t('workspace'), icon: FileText },
  ];

  return (
    <header className="app-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
        <Link href="/dashboard" className="brand-lockup" aria-label="Aven home">
          <span className="brand-mark"><BriefcaseBusiness size={17} strokeWidth={2.4} /></span>
          <span>aven</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`nav-link ${active ? 'nav-link-active' : ''}`}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/workspace" className="icon-button" title="Profile and documents" aria-label="Profile and documents">
            <UserRound size={18} />
          </Link>
          <button onClick={logout} className="icon-button" title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-[var(--line)] px-5 py-2 md:hidden" aria-label="Mobile navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`nav-link whitespace-nowrap ${pathname === href ? 'nav-link-active' : ''}`}>
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
