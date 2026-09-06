'use client';

import { Check, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={`language-switcher ${dark ? 'language-switcher-dark' : ''}`} role="group" aria-label={t('language')}>
      <Languages size={15} />
      <button type="button" onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>English {language === 'en' && <Check size={12} />}</button>
      <span className="language-divider">/</span>
      <button type="button" onClick={() => setLanguage('fr')} aria-pressed={language === 'fr'}>Français {language === 'fr' && <Check size={12} />}</button>
    </div>
  );
}
