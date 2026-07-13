import { AnalyticsClient } from "@/components/Analytics";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <AnalyticsClient />
        {children}
      </body>
    </html>
  );
}