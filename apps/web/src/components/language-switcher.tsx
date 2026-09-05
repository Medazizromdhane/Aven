'use client';

import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label className={`language-switcher ${dark ? 'language-switcher-dark' : ''}`} title={t('language')}>
      <Languages size={15} />
      <select value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'fr')} aria-label={t('language')}>
        <option value="en">EN</option>
        <option value="fr">FR</option>
      </select>
    </label>
  );
}
