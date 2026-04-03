"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

export function UmamiTrack(name: string, value: { [key: string]: any }) {
  if (typeof window === "undefined") return;
  if (!(window as any).umami) return;
  (window as any).umami.track(name, value);
}

export function UmamiPageView() {
  setTimeout(() => {
    if (typeof window === "undefined") return;
    if (!(window as any).umami) return;
    (window as any).umami.track((props: any) => ({
      ...props,
      url: window.location.pathname,
    }));
  }, 500);
}

export default function Analytics() {
  // Only load analytics in production
  if (process.env.NODE_ENV !== "production") return null;

  const siteId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  const src = process.env.NEXT_PUBLIC_ANALYTICS_URL + '/script.js';

  if (!siteId || !src) return null;

  return (
    <Script
      id="umami-script"
      defer
      src={src}
      data-website-id={siteId}
      data-auto-track="false"
    />
  );
}

export function AnalyticsClient() {
  const pathname = usePathname();
  
  // Track page views
  useEffect(() => {
    UmamiPageView();
  }, [pathname]);
  
  return <Analytics />;
}
