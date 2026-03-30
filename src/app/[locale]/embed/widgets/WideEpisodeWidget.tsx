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

interface WideEpisodeWidgetProps {
  episode: Episode;
  show?: Show;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function WideEpisodeWidget({ episode, show }: WideEpisodeWidgetProps) {
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
    <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg w-full">
      <div className="flex flex-col sm:flex-row">
        {/* Cover Image */}
        <div className="w-full sm:w-32 h-32 flex-shrink-0 relative">
          <EmbedImage
            src={episode.Cover}
            alt={episode.Title}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
          
          {/* Play overlay on mobile */}
          {episode.Audio && (
            <button
              onClick={playEpisode}
              className="sm:hidden absolute inset-0 bg-black/40 flex items-center justify-center"
              aria-label={isThisPlaying ? "Pause" : "Play"}
            >
              <div className="w-12 h-12 rounded-full bg-[#d43c4a] flex items-center justify-center">
                {isLoading && isCurrentEpisode ? (
                  <svg
                    className="w-5 h-5 animate-spin text-white"
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
                    className={`text-white ${!isThisPlaying ? "ml-0.5" : ""}`}
                  />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base line-clamp-2">
                {episode.Title}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views}{" "}
                {episode.Views === 1 ? "vypočutie" : "vypočutí"}
              </p>
            </div>

            {/* Play Button (desktop) */}
            {episode.Audio && (
              <button
                onClick={playEpisode}
                disabled={isLoading && isCurrentEpisode}
                className={`hidden sm:flex w-10 h-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                  isThisPlaying
                    ? "bg-[#d43c4a] text-white"
                    : "bg-zinc-700 text-zinc-300 hover:bg-[#d43c4a] hover:text-white"
                }`}
                aria-label={isThisPlaying ? "Pause" : "Play"}
              >
                {isLoading && isCurrentEpisode ? (
                  <svg
                    className="w-4 h-4 animate-spin"
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
                    className={`text-sm ${!isThisPlaying ? "ml-0.5" : ""}`}
                  />
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isCurrentEpisode && duration > 0 && (
            <div className="mt-3">
              <div
                onClick={handleProgressClick}
                className="h-1 bg-zinc-700 rounded-full cursor-pointer overflow-hidden"
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

          {/* Link */}
          <a
            href={showLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#d43c4a] text-xs mt-2 hover:underline self-start"
          >
            Otvoriť na tlis.sk
            <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
          </a>
        </div>
      </div>
    </div>
  );
}
