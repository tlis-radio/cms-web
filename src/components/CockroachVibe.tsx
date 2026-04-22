"use client";

import { useEffect, useMemo, useState } from "react";
import cockroachGif from "@/hooks/coackroach-vibe.gif";
import { useCurrentPlayerBeatSyncedGif } from "@/hooks/useBeatSyncedGif";
import { usePlayer } from "@/context/PlayerContext";

const GIF_LOOP_DURATION_SECONDS = 1.65;
const GIF_BEAT_TIMESTAMPS_SECONDS = [0, 0.412, 0.824, 1.236];

export default function CockroachVibe() {
  const [gifToken, setGifToken] = useState(0);
  const [stillFrameSrc, setStillFrameSrc] = useState<string | null>(null);
  const { isPlaying } = usePlayer();

  const { bps } = useCurrentPlayerBeatSyncedGif({
    enabled: true,
    gifLoopDurationSeconds: GIF_LOOP_DURATION_SECONDS,
    gifBeatTimestampsSeconds: GIF_BEAT_TIMESTAMPS_SECONDS,
    minPlaybackRate: 0,
    maxPlaybackRate: 2.5,
  });

  const speed = useMemo(() => {
    if (!isPlaying || !bps || !Number.isFinite(bps) || bps <= 0) return 0;
    return Math.min(4, Math.max(0, bps));
  }, [bps, isPlaying]);

  useEffect(() => {
    const image = new Image();
    image.src = cockroachGif.src;
    image.decoding = "async";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 420;
      canvas.height = image.naturalHeight || 420;
      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      setStillFrameSrc(canvas.toDataURL("image/png"));
    };
  }, []);

  useEffect(() => {
    if (speed <= 0) return;

    const restartMs = Math.max(90, Math.round(1000 / speed));
    const interval = window.setInterval(() => {
      setGifToken((prev) => prev + 1);
    }, restartMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [speed]);

  const imageSrc = speed <= 0
    ? (stillFrameSrc ?? `${cockroachGif.src}?v=still`)
    : `${cockroachGif.src}?v=${gifToken}`;


  return (
    <div className="fixed right-2 bottom-20 sm:right-6 sm:bottom-24 z-40 pointer-events-none select-none">
      <img
        key={speed <= 0 ? "still" : gifToken}
        src={imageSrc}
        width={420}
        height={420}
        alt="Cockroach vibing with the music"
        className="w-52 h-52 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px] object-contain"
        draggable={false}
      />
    </div>
  );
}
