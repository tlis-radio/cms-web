import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
  title: 'Radio TLIS',
  description: 'Radio TLIS — alternatívna hudba, relácie a kultúra.',
  alternates: { canonical: SITE_URL + "/" },
  openGraph: {
    title: 'Radio TLIS',
    description: 'Radio TLIS — alternatívna hudba, relácie a kultúra.',
    url: SITE_URL + "/",
    siteName: 'Radio TLIS',
    locale: 'sk_SK',
  },
};

declare global {
  interface Window {
    umami?: any;
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_ANALYTICS_URL && (
        <Script id="umami-script" src={process.env.NEXT_PUBLIC_ANALYTICS_URL + '/script.js'} data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_ID} />
      )}
      <body>
        {children}
      </body>
    </html>
  );
}
