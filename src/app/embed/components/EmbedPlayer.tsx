"use client";
import { useEmbedPlayer } from "../context/EmbedPlayerContext";
import EmbedImage from "./EmbedImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faVolumeUp } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function EmbedPlayer() {
  const {
    isPlaying,
    setIsPlaying,
    isLoading,
    episodeName,
    episodeCover,
    currentTime,
    updateCurrentTime,
    duration,
    src,
  } = useEmbedPlayer();

  const progressRef = useRef<HTMLDivElement>(null);

  if (!src) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    updateCurrentTime(newTime);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700 p-3">
      <div className="max-w-screen-lg mx-auto flex items-center gap-3">
        {/* Cover */}
        {episodeCover && (
          <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden">
            <EmbedImage
              src={episodeCover}
              alt={episodeName || "Episode cover"}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {episodeName || "Neznáma epizóda"}
          </p>
          <p className="text-zinc-400 text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        {/* Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="hidden sm:flex flex-1 h-1 bg-zinc-700 rounded-full cursor-pointer"
        >
          <div
            className="h-full bg-[#d43c4a] rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isLoading}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-colors disabled:opacity-50"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
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
              icon={isPlaying ? faPause : faPlay}
              className={`text-white ${!isPlaying ? "ml-0.5" : ""}`}
            />
          )}
        </button>
      </div>

      {/* Mobile Progress Bar */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="sm:hidden mt-2 h-1 bg-zinc-700 rounded-full cursor-pointer"
      >
        <div
          className="h-full bg-[#d43c4a] rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
