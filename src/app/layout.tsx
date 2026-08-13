import { AnalyticsClient } from "@/components/Analytics";
import { PlayerProvider } from "@/context/PlayerContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
    <html lang="sk" className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <AnalyticsClient />
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
