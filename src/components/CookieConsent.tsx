'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_COOKIE_NAME = 'tlis_cookie_consent';
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
    
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set consent cookie
    document.cookie = `${CONSENT_COOKIE_NAME}=accepted; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
    setShowBanner(false);
    // Notify other components about consent change
    window.dispatchEvent(new Event('cookieConsentChange'));
  };

  const rejectCookies = () => {
    // Set rejection cookie (still using a cookie to remember the choice)
    document.cookie = `${CONSENT_COOKIE_NAME}=rejected; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax`;
    setShowBanner(false);
    // Notify other components about consent change
    window.dispatchEvent(new Event('cookieConsentChange'));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={rejectCookies} />
      <div className="relative z-10 w-full max-w-xl mx-4 p-6 bg-white dark:bg-neutral-900 dark:text-white rounded-lg shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-sm flex-1 text-slate-800 dark:text-slate-200">
            <p>
              Používame cookies na zlepšenie vášho zážitku. Pokračovaním súhlasíte s našim používaním cookies.{' '}
              <Link href="/gdpr" className="underline hover:text-slate-600 dark:hover:text-slate-300">
                Viac informácií
              </Link>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={rejectCookies}
              className="px-4 py-2 text-sm border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Odmietnuť
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 text-sm bg-[#d43c4a] hover:bg-[#b83744] text-white rounded-md transition-colors"
            >
              Súhlasím
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
