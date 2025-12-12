"use client";
import { useEffect } from "react";

const CONSENT_COOKIE_NAME = 'tlis_cookie_consent';

/**
 * Component that initializes session cookie on mount.
 * Include this in root layouts to ensure all users get a session.
 * Respects cookie consent - passes anonymous flag if cookies rejected.
 */
export default function SessionInit() {
  useEffect(() => {
    const initSession = () => {
      // Check cookie consent status
      const consent = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
      
      const consentValue = consent?.split('=')[1];
      const isAnonymous = consentValue === 'rejected' || !consentValue;
      
      // Initialize session with anonymous flag if needed
      const url = isAnonymous ? '/api/session?anonymous=true' : '/api/session';
      fetch(url, { credentials: "include" }).catch((err) => {
        console.error("Failed to initialize session:", err);
      });
    };

    // Initialize immediately
    initSession();

    // Listen for consent changes (when user accepts/rejects)
    const handleConsentChange = () => {
      initSession();
    };

    window.addEventListener('cookieConsentChange', handleConsentChange);
    return () => window.removeEventListener('cookieConsentChange', handleConsentChange);
  }, []);

  return null;
}
