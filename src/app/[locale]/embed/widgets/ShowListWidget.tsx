"use client";
import React from "react";
import { useEmbedPlayer } from "../context/EmbedPlayerContext";
import EmbedImage from "../components/EmbedImage";
import EmbedPlayer from "../components/EmbedPlayer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { useTranslations, useLocale } from "next-intl"; // Added imports

interface Episode {
  id: number;
  Title: string;
  Cover: string;
  Audio: string;
  Date: string;
  Views: number;
  Description?: string;
}

interface Show {
  id: number;
  Title: string;
  Cover: string;
  Slug: string;
  Description?: string;
}

interface ShowListWidgetProps {
  show: Show;
  episodes: Episode[];
  totalCount: number;
}

function EpisodeItem({ episode, showName }: { episode: Episode; showName: string }) {
  const t = useTranslations("ShowPage"); // Hook for translations
  const locale = useLocale(); // Hook for date formatting
  const {
    setIsPlaying,
    setSrc,
    setEpisodeName,
    setEpisodeCover,
    setEpisodeId,
    isPlaying,
    src,
  } = useEmbedPlayer();

  const episodeSrc = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio}`;
  const isCurrentEpisode = src === episodeSrc;
  const isThisPlaying = isCurrentEpisode && isPlaying;

  function playEpisode() {
    if (isCurrentEpisode) {
      setIsPlaying(!isPlaying);
    } else {
      setEpisodeName(episode.Title);
      setEpisodeCover(episode.Cover);
      setEpisodeId(episode.id);
      setSrc(episodeSrc);
      setIsPlaying(true);
    }
  }

  return (
    <div className="group flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800 last:border-b-0">
      <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden relative">
        <EmbedImage
          src={episode.Cover}
          alt={episode.Title}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
        {episode.Audio && (
          <button
            onClick={playEpisode}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={isThisPlaying ? "Pause" : "Play"}
          >
            <FontAwesomeIcon
              icon={isThisPlaying ? faPause : faPlay}
              className="text-white text-sm"
            />
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{episode.Title}</p>
        <p className="text-zinc-400 text-xs">
          {/* Formatted Date and Translated Views */}
          {new Date(episode.Date).toLocaleDateString(locale === 'sk' ? "sk-SK" : "en-US")} • {episode.Views}{" "}
          {t('views_count')}
        </p>
      </div>

      {episode.Audio && (
        <button
          onClick={playEpisode}
          className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${
            isThisPlaying
              ? "bg-[#d43c4a] text-white"
              : "bg-zinc-700 text-zinc-300 hover:bg-[#d43c4a] hover:text-white"
          }`}
          aria-label={isThisPlaying ? "Pause" : "Play"}
        >
          <FontAwesomeIcon
            icon={isThisPlaying ? faPause : faPlay}
            className={`text-xs ${!isThisPlaying ? "ml-0.5" : ""}`}
          />
        </button>
      )}
    </div>
  );
}

export default function ShowListWidget({ show, episodes, totalCount }: ShowListWidgetProps) {
  const t = useTranslations("ShowPage");
  const locale = useLocale();
  const { src } = useEmbedPlayer();
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 p-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
            <EmbedImage
              src={show.Cover}
              alt={show.Title}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{show.Title}</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {/* Translated Episode Count */}
              {totalCount} {t('episodes_count')}
            </p>
            <a
              href={`${SITE_URL}/${locale}/relacie/${show.Slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#d43c4a] text-xs mt-2 hover:underline"
            >
              {t('open_on_site')}
              <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
            </a>
          </div>
        </div>
      </div>

      <div className={`${src ? "pb-20" : ""}`}>
        {episodes.map((episode) => (
          <EpisodeItem key={episode.id} episode={episode} showName={show.Title} />
        ))}

        {episodes.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            {t('no_episodes')}
          </div>
        )}

        {totalCount > episodes.length && (
          <div className="p-4 text-center">
            <a
              href={`${SITE_URL}/${locale}/relacie/${show.Slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d43c4a] text-sm hover:underline"
            >
              {t('show_all_episodes')} ({totalCount})
            </a>
          </div>
        )}
      </div>

      <EmbedPlayer />
    </div>
  );
}