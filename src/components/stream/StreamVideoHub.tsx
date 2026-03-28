"use client";

import { PublicStreamEntry } from "@/types/stream";
import { useEffect, useMemo, useRef, useState } from "react";

type PlaybackMode = "live" | "archive";
type LiveState = "connecting" | "live" | "offline" | "unsupported";

type StreamVideoHubProps = {
  liveFlvBaseUrl: string;
  currentStream: PublicStreamEntry | null;
  streams: PublicStreamEntry[];
};

type MpegTsRuntime = {
  getFeatureList: () => { mseLivePlayback: boolean };
  createPlayer: (mediaDataSource: Record<string, unknown>, config?: Record<string, unknown>) => any;
  Events: {
    ERROR: string;
    STATISTICS_INFO: string;
  };
};

const RETRY_INTERVAL = 5000;
const ARCHIVE_PAGE_SIZE = 8;

function formatDate(dateRaw?: string | null): string {
  if (!dateRaw) return "Unknown date";
  const date = new Date(dateRaw);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getEpisodeTitle(episode: PublicStreamEntry["episode"]): string {
  if (!episode) return "Bez epizódy";
  if (typeof episode === "object" && "Title" in episode && typeof episode.Title === "string") {
    return episode.Title;
  }
  return `Epizóda #${String(episode)}`;
}

function getEpisodeCover(episode: PublicStreamEntry["episode"]): string | null {
  if (!episode) return null;
  if (typeof episode === "object" && "Cover" in episode && typeof episode.Cover === "string") {
    return episode.Cover;
  }
  return null;
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "00:00";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function StreamVideoHub({
  liveFlvBaseUrl,
  currentStream,
  streams,
}: StreamVideoHubProps) {
  const [mode, setMode] = useState<PlaybackMode>("live");
  const [liveState, setLiveState] = useState<LiveState>("connecting");
  const [selectedArchiveUrl, setSelectedArchiveUrl] = useState<string | null>(null);
  const [archivePage, setArchivePage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const mpegtsRef = useRef<MpegTsRuntime | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destroyInProgressRef = useRef(false);

  const archiveEntries = useMemo(
    () => streams.filter((entry) => typeof entry.archive_url === "string" && entry.archive_url.length > 0),
    [streams],
  );

  const paginatedEntries = useMemo(() => {
    const start = (archivePage - 1) * ARCHIVE_PAGE_SIZE;
    return streams.slice(start, start + ARCHIVE_PAGE_SIZE);
  }, [streams, archivePage]);

  const totalArchivePages = useMemo(() => {
    if (streams.length === 0) return 1;
    return Math.ceil(streams.length / ARCHIVE_PAGE_SIZE);
  }, [streams.length]);

  const liveStreamId = useMemo(() => {
    if (currentStream?.id !== undefined && currentStream?.id !== null) return String(currentStream.id);
    const liveEntry = streams.find((entry) => entry.status === "live");
    if (liveEntry?.id !== undefined && liveEntry?.id !== null) return String(liveEntry.id);
    return null;
  }, [currentStream, streams]);

  const liveFlvUrl = useMemo(() => {
    if (!liveFlvBaseUrl || !liveStreamId) return "";
    const normalizedBase = liveFlvBaseUrl.endsWith("/")
      ? liveFlvBaseUrl.slice(0, -1)
      : liveFlvBaseUrl;
    return `${normalizedBase}/${liveStreamId}.flv`;
  }, [liveFlvBaseUrl, liveStreamId]);

  const selectedArchiveEntry = useMemo(() => {
    if (!selectedArchiveUrl) return null;
    return streams.find((entry) => entry.archive_url === selectedArchiveUrl) || null;
  }, [selectedArchiveUrl, streams]);

  const activeOverlayEntry = useMemo(() => {
    if (mode === "live") {
      return currentStream || streams.find((entry) => entry.status === "live") || null;
    }
    return selectedArchiveEntry;
  }, [mode, currentStream, streams, selectedArchiveEntry]);

  useEffect(() => {
    if (!selectedArchiveUrl && archiveEntries.length > 0) {
      setSelectedArchiveUrl(archiveEntries[0].archive_url || null);
    }
  }, [archiveEntries, selectedArchiveUrl]);

  useEffect(() => {
    if (archivePage > totalArchivePages) {
      setArchivePage(totalArchivePages);
    }
  }, [archivePage, totalArchivePages]);

  const clearRetryTimer = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const destroyPlayer = () => {
    destroyInProgressRef.current = true;
    clearRetryTimer();

    if (playerRef.current) {
      try {
        playerRef.current.detachMediaElement();
        playerRef.current.unload();
        playerRef.current.destroy();
      } catch (error) {
        console.warn("Failed to destroy MPEG-TS player", error);
      } finally {
        playerRef.current = null;
      }
    }

    destroyInProgressRef.current = false;
  };

  const startLivePlayer = async () => {
    if (!videoRef.current || !liveFlvUrl) {
      setLiveState("offline");
      return;
    }

    if (!mpegtsRef.current) {
      const mod = await import("mpegts.js");
      mpegtsRef.current = mod.default as unknown as MpegTsRuntime;
    }

    const mpegts = mpegtsRef.current;
    if (!mpegts.getFeatureList().mseLivePlayback) {
      setLiveState("unsupported");
      return;
    }

    destroyPlayer();
    setLiveState("connecting");

    const player = mpegts.createPlayer(
      {
        type: "flv",
        isLive: true,
        url: liveFlvUrl,
        hasAudio: true,
        hasVideo: true,
      },
      {
        enableWorker: true,
        enableStashBuffer: true,
        stashInitialSize: 512,
        liveBufferLatencyChasing: true,
        liveBufferLatencyMaxLatency: 2,
        liveBufferLatencyMinRemain: 0.5,
        autoCleanupSourceBuffer: true,
        autoCleanupMinBackwardDuration: 10,
        autoCleanupMaxBackwardDuration: 20,
      },
    );

    player.on(mpegts.Events.ERROR, () => {
      if (destroyInProgressRef.current) return;
      setLiveState("offline");
      destroyPlayer();
      retryTimerRef.current = setTimeout(() => {
        startLivePlayer().catch((error) => {
          console.error("FLV reconnect failed", error);
          setLiveState("offline");
        });
      }, RETRY_INTERVAL);
    });

    player.on(mpegts.Events.STATISTICS_INFO, () => {
      if (destroyInProgressRef.current) return;
      setLiveState("live");
    });

    playerRef.current = player;
    player.attachMediaElement(videoRef.current);
    player.load();
    videoRef.current.controls = false;

    videoRef.current.play().catch(() => {
      // Browser may block autoplay with audio until user interaction.
    });
  };

  useEffect(() => {
    if (mode === "live") {
      startLivePlayer().catch((error) => {
        console.error("Unable to start FLV live player", error);
        setLiveState("offline");
      });
      return () => {
        destroyPlayer();
      };
    }

    destroyPlayer();

    const video = videoRef.current;
    if (!video) return;

    if (selectedArchiveUrl) {
      video.src = selectedArchiveUrl;
      video.controls = false;
      video.load();
    }

    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [mode, selectedArchiveUrl, liveFlvUrl]);

  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleDurationChange = () => setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoaded = () => {
      setCurrentTime(video.currentTime || 0);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadedmetadata", handleLoaded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadedmetadata", handleLoaded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        // User gesture can still be required in some browsers.
      });
      return;
    }

    video.pause();
  };

  const seekTo = (nextTime: number) => {
    const video = videoRef.current;
    if (!video || mode !== "archive") return;
    video.currentTime = Math.max(0, Math.min(nextTime, duration || 0));
  };

  const seekBy = (deltaSeconds: number) => {
    seekTo(currentTime + deltaSeconds);
  };

  const showProgress = mode === "archive";

  const liveStatusText =
    liveState === "live"
      ? "LIVE NOW"
      : liveState === "connecting"
        ? "CONNECTING"
        : liveState === "unsupported"
          ? "BROWSER UNSUPPORTED"
          : "OFFLINE";

  return (
    <div className="pb-8 text-left w-full">
      <div className="rounded-2xl border border-zinc-700/70 bg-zinc-950/95 backdrop-blur-sm overflow-hidden shadow-[0_26px_65px_-28px_rgba(0,0,0,0.95)]">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${liveState === "live" ? "bg-red-500 animate-pulse" : "bg-zinc-500"}`}
            />
            <span
              className={`text-xs tracking-[0.22em] font-semibold ${liveState === "live" ? "text-red-400" : "text-zinc-400"}`}
            >
              {liveStatusText}
            </span>
            {activeOverlayEntry && (
              <span className="text-zinc-300 text-sm">• {getEpisodeTitle(activeOverlayEntry.episode)}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("live")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === "live"
                  ? "bg-[#d43c4a] text-white"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              Live
            </button>
            <button
              type="button"
              onClick={() => setMode("archive")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === "archive"
                  ? "bg-[#d43c4a] text-white"
                  : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              Archive
            </button>
          </div>
        </div>

        <div className={`relative bg-black ${mode === "live" && !liveStreamId ? "hidden" : "block"}`}>
          <div className="relative w-full pt-[53%] min-h-[320px]">
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full"
              playsInline
              preload="metadata"
            />

            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${mode === "live" ? "bg-red-600/80 text-white" : "bg-zinc-700/80 text-zinc-100"}`}>
                    {mode === "live" ? "LIVE" : "ARCHIVE"}
                  </span>
                  <h2 className="text-white text-xl sm:text-2xl font-semibold mt-3 drop-shadow-sm">
                    {activeOverlayEntry ? getEpisodeTitle(activeOverlayEntry.episode) : "Radio TLIS stream"}
                  </h2>
                  <p className="text-zinc-200/90 text-sm mt-1">
                    {activeOverlayEntry?.started_at ? `Started ${formatDate(activeOverlayEntry.started_at)}` : "Waiting for stream data"}
                  </p>
                </div>

                {mode === "live" && (
                  <button
                    type="button"
                    onClick={() => {
                      startLivePlayer().catch((error) => {
                        console.error("Manual FLV reconnect failed", error);
                      });
                    }}
                    className="pointer-events-auto px-4 py-2 rounded-md bg-white/10 text-white text-sm font-medium hover:bg-white/20 border border-white/20 transition-colors"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>

            {mode === "live" && liveState !== "live" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 gap-3">
                <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <p className="text-sm text-zinc-300 text-center px-4">
                  {liveState === "connecting" && "Pripájam sa na živý stream..."}
                  {liveState === "offline" && (liveStreamId
                    ? "Live stream je offline. Pokúšam sa o reconnect."
                    : "Živý stream momentálne nebeží.")}
                  {liveState === "unsupported" && "Tento prehliadač nepodporuje live playback."}
                </p>
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
              {showProgress && (
                <input
                  aria-label="Archive progress"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.1}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full mb-3 cursor-pointer accent-[#d43c4a]"
                />
              )}

              <div className="flex items-center justify-between gap-3 text-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-[#d43c4a] hover:bg-[#b73642] transition-colors flex items-center justify-center text-white shrink-0"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {mode === "archive" && (
                    <>
                      <button
                        type="button"
                        onClick={() => seekBy(-15)}
                        className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm"
                      >
                        -15s
                      </button>
                      <button
                        type="button"
                        onClick={() => seekBy(15)}
                        className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm"
                      >
                        +15s
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-[220px] justify-end">
                  <button
                    type="button"
                    onClick={() => setIsMuted((prev) => !prev)}
                    className="text-sm px-3 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? "Unmute" : "Mute"}
                  </button>

                  <input
                    aria-label="Volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-28 cursor-pointer accent-[#d43c4a]"
                  />

                  <span className="text-xs tabular-nums text-zinc-300 min-w-[82px] text-right">
                    {mode === "archive"
                      ? `${formatDuration(currentTime)} / ${formatDuration(duration)}`
                      : "Live"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {mode === "live" && !liveStreamId && (
          <div className="py-24 flex flex-col items-center justify-center bg-zinc-950/50">
            <p className="text-zinc-400 text-lg tracking-wide uppercase font-medium">Stream Offline</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h3 className="text-white text-xl font-semibold">Archive</h3>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span>Page {archivePage} of {totalArchivePages}</span>
            <button
              type="button"
              onClick={() => setArchivePage((page) => Math.max(1, page - 1))}
              disabled={archivePage === 1}
              className="h-8 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setArchivePage((page) => Math.min(totalArchivePages, page + 1))}
              disabled={archivePage === totalArchivePages}
              className="h-8 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {paginatedEntries.map((entry) => {
              const episodeTitle = getEpisodeTitle(entry.episode);
              const episodeCover = getEpisodeCover(entry.episode);
              const hasArchive = typeof entry.archive_url === "string" && entry.archive_url.length > 0;

              return (
                <article
                  key={String(entry.id)}
                  className="flex flex-col gap-3 group"
                >
                  <div className="relative aspect-[16/9] w-full bg-zinc-900 rounded-md overflow-hidden">
                    {episodeCover ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episodeCover}?width=600&quality=80`}
                        alt={episodeTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5v15m-7.5-15v15" />
                        </svg>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        disabled={!hasArchive}
                        onClick={() => {
                          if (!entry.archive_url) return;
                          setSelectedArchiveUrl(entry.archive_url);
                          setMode("archive");
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-12 h-12 rounded-full bg-[#d43c4a] text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
                      >
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>

                    {entry.status === "live" && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">
                        LIVE
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-zinc-100 text-sm font-medium leading-snug line-clamp-2">{episodeTitle}</h4>
                  </div>
                </article>
              );
            })}

            {paginatedEntries.length === 0 && (
              <p className="text-zinc-400 text-sm py-4">Zatiaľ nie sú k dispozícii žiadne záznamy.</p>
            )}
        </div>
      </div>
    </div>
  );
}
