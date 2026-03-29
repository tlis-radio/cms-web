import "./embed.css";
import { EmbedPlayerProvider } from "./context/EmbedPlayerContext";
import EmbedSessionInit from "@/components/EmbedSessionInit";

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
    <>
      <EmbedSessionInit />
      <EmbedPlayerProvider>
        {children}
      </EmbedPlayerProvider>
    </>
  );
}