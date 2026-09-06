'use client';

import { useEffect, useRef } from 'react';

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileWidget = { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void; theme: 'light' | 'dark' }) => void };

declare global {
  interface Window { turnstile?: TurnstileWidget; }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey || !container.current) return;
    const render = () => {
      if (!container.current || !window.turnstile) return;
      window.turnstile.render(container.current, { sitekey: siteKey, theme: 'light', callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken('') });
    };
    if (window.turnstile) render();
    else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', render);
      document.head.appendChild(script);
      return () => script.removeEventListener('load', render);
    }
  }, [onToken]);

  return siteKey ? <div ref={container} className="turnstile-wrap" aria-label="Security verification" /> : null;
}
