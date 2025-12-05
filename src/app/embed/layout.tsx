import "./embed.css";
import { EmbedPlayerProvider } from "./context/EmbedPlayerContext";
import SessionInit from "@/components/SessionInit";

export const metadata = {
  title: 'Rádio TLIS - Embed Widget',
  robots: {
    index: false,
    follow: false
  }
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body className="bg-transparent">
        <SessionInit />
        <EmbedPlayerProvider>
          {children}
        </EmbedPlayerProvider>
      </body>
    </html>
  );
}
