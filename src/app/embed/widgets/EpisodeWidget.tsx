"use client";
import React from "react";
import { useEmbedPlayer } from "../context/EmbedPlayerContext";
import EmbedImage from "../components/EmbedImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

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
  Slug: string;
  Title: string;
}

interface EpisodeWidgetProps {
  episode: Episode;
  show?: Show;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function EpisodeWidget({ episode, show }: EpisodeWidgetProps) {
  const {
    setIsPlaying,
    setSrc,
    setEpisodeName,
    setEpisodeCover,
    setEpisodeId,
    isPlaying,
    isLoading,
    src,
    currentTime,
    duration,
    updateCurrentTime,
  } = useEmbedPlayer();

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
  const episodeSrc = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio}`;
  const isCurrentEpisode = src === episodeSrc;
  const isThisPlaying = isCurrentEpisode && isPlaying;
  const progress = isCurrentEpisode && duration > 0 ? (currentTime / duration) * 100 : 0;

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

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isCurrentEpisode || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    updateCurrentTime(newTime);
  }

  const showLink = show
    ? `${SITE_URL}/relacie/${show.Slug}?sharedEpisode=${episode.id}`
    : `${SITE_URL}`;

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl max-w-sm w-full">
      {/* Cover Image */}
      <div className="relative aspect-square">
        <EmbedImage
          src={episode.Cover}
          alt={episode.Title}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        
        {/* Play button centered */}
        {episode.Audio && (
          <button
            onClick={playEpisode}
            disabled={isLoading && isCurrentEpisode}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={isThisPlaying ? "Pause" : "Play"}
          >
            <div className="w-16 h-16 rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-all hover:scale-105 flex items-center justify-center shadow-lg">
              {isLoading && isCurrentEpisode ? (
                <svg
                  className="w-6 h-6 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <FontAwesomeIcon
                  icon={isThisPlaying ? faPause : faPlay}
                  className={`text-white text-xl ${!isThisPlaying ? "ml-1" : ""}`}
                />
              )}
            </div>
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h2 className="text-white text-lg font-bold line-clamp-2">{episode.Title}</h2>
        <p className="text-zinc-400 text-sm mt-1">
          {new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views}{" "}
          {episode.Views === 1 ? "vypočutie" : "vypočutí"}
        </p>

        {/* Progress Bar (only if this episode is active) */}
        {isCurrentEpisode && duration > 0 && (
          <div className="mt-3">
            <div
              onClick={handleProgressClick}
              className="h-1.5 bg-zinc-700 rounded-full cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-[#d43c4a] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Link to tlis.sk */}
        <a
          href={showLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#d43c4a] text-xs mt-3 hover:underline"
        >
          Otvoriť na tlis.sk
          <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
        </a>
      </div>
    </div>
  );
}
