import React from "react";
import "../globals.css";
import type { Metadata } from "next";
import { GalleryProvider } from "@/components/carousel/gallery/GalleryProvider";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmbeddedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk">
      <body className="bg-transparent">
        <GalleryProvider>
          {children}
        </GalleryProvider>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
