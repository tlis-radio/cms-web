import React from "react";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
const DIRECTUS = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";

function imageUrl(id?: string) {
  if (!id) return undefined;
  if (id.startsWith("http")) return id;
  return `${DIRECTUS}/assets/${id}`;
}

export default function ShowJsonLd({ show, episodes }: { show: any; episodes?: any[] }) {
  if (!show) return null;

  const series = {
    "@context": "https://schema.org",
    "@type": ["RadioSeries", "PodcastSeries"],
    "name": show.Title || "Relácia",
    "description": show.Description || `Relácia ${show.Title || "na Radiu TLIS"}`,
    "url": `${SITE_URL}/relacie/${show.Slug || show.Slug}`,
    "image": imageUrl(show.Cover),
    "publisher": {
      "@type": "Organization",
      "name": "Radio TLIS",
      "url": SITE_URL,
    },
    "hasPart": (episodes || []).map((ep: any) => ({
      "@type": ["RadioEpisode", "PodcastEpisode"],
      "name": ep.Title,
      "url": `${SITE_URL}/relacie/${show.Slug}#episode-${ep.id}`,
      "datePublished": ep.Date,
      "image": imageUrl(ep.Cover),
      "description": ep.Title || undefined,
    })),
  };

  const episodeScripts = (episodes || []).map((ep: any) => {
    const audioId = ep.Audio?.id || ep.Audio;
    const audioUrl = audioId ? (typeof audioId === 'string' && audioId.startsWith("http") ? audioId : `${DIRECTUS}/assets/${audioId}`) : undefined;
    return {
      "@context": "https://schema.org",
      "@type": ["RadioEpisode", "PodcastEpisode"],
      "name": ep.Title,
      "description": ep.Title || show.Description || undefined,
      "url": `${SITE_URL}/relacie/${show.Slug}#episode-${ep.id}`,
      "datePublished": ep.Date,
      "image": imageUrl(ep.Cover),
      "partOfSeries": {
        "@type": ["RadioSeries", "PodcastSeries"],
        "name": show.Title,
        "url": `${SITE_URL}/relacie/${show.Slug}`,
      },
      "associatedMedia": audioUrl ? { "@type": "AudioObject", "contentUrl": audioUrl } : undefined,
    };
  });

  return (
    <>
      <JsonLd data={series} />
      {episodeScripts.map((s: any, i: number) => (
        <JsonLd key={i} data={s} />
      ))}
    </>
  );
}
