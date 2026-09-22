import { AnalyticsClient } from "@/components/Analytics";
import { PlayerProvider } from "@/context/PlayerContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
    <html lang="sk" className="overflow-x-hidden">
      <head>
        {/* Vyhľadávanie z adresného riadku prehliadača — viď app/opensearch.xml */}
        <link rel="search" type="application/opensearchdescription+xml" title="Radio TLIS" href="/opensearch.xml" />
      </head>
      <body className="overflow-x-hidden">
        <AnalyticsClient />
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
