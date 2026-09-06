'use client';

import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem('aven_cookie_consent') !== 'accepted');
  }, []);

  function accept() {
    localStorage.setItem('aven_cookie_consent', 'accepted');
    setVisible(false);
  }

  if (!visible) return null;
  return <aside className="cookie-banner" role="dialog" aria-label="Cookie consent">
    <div className="cookie-icon"><Cookie size={18} /></div>
    <div className="flex-1"><strong>Respect de votre vie privée</strong><p>Nous utilisons uniquement les cookies nécessaires au fonctionnement d’Aven. Consultez notre <Link href="/cookies">politique de cookies</Link>.</p></div>
    <div className="cookie-actions"><button type="button" className="cookie-accept" onClick={accept}>J’accepte</button><button type="button" className="cookie-close" onClick={accept} aria-label="Fermer"><X size={17} /></button></div>
  </aside>;
}
