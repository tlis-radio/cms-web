import { AnalyticsClient } from "@/components/Analytics";
import { PlayerProvider } from "@/context/PlayerContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
    <html lang="sk">
      <body>
        <AnalyticsClient />
        <PlayerProvider>
          {children}
        </PlayerProvider>
      </body>
    </html>
  );
}
