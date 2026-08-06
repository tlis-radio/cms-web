import "./embed.css";
import { EmbedPlayerProvider } from "./context/EmbedPlayerContext";

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
      <EmbedPlayerProvider>
        {children}
      </EmbedPlayerProvider>
    </>
  );
}