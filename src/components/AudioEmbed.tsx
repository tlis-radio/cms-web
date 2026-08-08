"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

interface AudioEmbedProps {
   audioId: string;
}

export default function AudioEmbed({ audioId }: AudioEmbedProps) {
   const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
   const src = `${DIRECTUS_URL}/assets/${audioId}`;

   const audioRef = useRef<HTMLAudioElement | null>(null);
   const canvasRef = useRef<HTMLCanvasElement | null>(null);
   const audioCtxRef = useRef<AudioContext | null>(null);
   const analyserRef = useRef<AnalyserNode | null>(null);
   const rafRef = useRef<number>(0);
   const durationRef = useRef(0);
   const fixingDurationRef = useRef(false);
   // Random parameters for the placeholder waveform (sum of 3 sines), generated once
   const fakeWaveRef = useRef<{ f: number[]; p: number[] } | null>(null);

   const [isPlaying, setIsPlaying] = useState(false);
   const [title, setTitle] = useState<string>("Audio súbor");
   const [duration, setDurationState] = useState(0);
   const [currentTime, setCurrentTime] = useState(0);

   function setDuration(seconds: number) {
      durationRef.current = seconds;
      setDurationState(seconds);
   }

   // Fetch file title and duration from CMS
   useEffect(() => {
      fetch(`${DIRECTUS_URL}/files/${audioId}?fields=title,filename_download,duration`)
         .then((res) => (res.ok ? res.json() : null))
         .then((data) => {
            const fileTitle = data?.data?.title || data?.data?.filename_download;
            if (fileTitle) setTitle(fileTitle);
            const fileDuration = Number(data?.data?.duration);
            if (isFinite(fileDuration) && fileDuration > 0) setDuration(fileDuration);
         })
         .catch(() => { });
   }, [audioId, DIRECTUS_URL]);

   const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const audio = audioRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
         canvas.width = width * dpr;
         canvas.height = height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const knownDuration = audio && isFinite(audio.duration) && audio.duration > 0
         ? audio.duration
         : durationRef.current;
      const progress = audio && knownDuration ? audio.currentTime / knownDuration : 0;

      const barWidth = 3;
      const gap = 2;
      const barCount = Math.max(1, Math.floor(width / (barWidth + gap)));

      let frequencyData: Uint8Array | null = null;
      if (analyserRef.current) {
         frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
         analyserRef.current.getByteFrequencyData(frequencyData);
      }

      if (!frequencyData && !fakeWaveRef.current) {
         fakeWaveRef.current = {
            f: [0.05 + Math.random() * 0.1, 0.15 + Math.random() * 0.2, 0.4 + Math.random() * 0.4],
            p: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
         };
      }

      for (let i = 0; i < barCount; i++) {
         let value = 0;
         if (frequencyData) {
            const bin = Math.floor((i / barCount) * frequencyData.length * 0.7);
            value = frequencyData[bin] / 255;
         } else if (fakeWaveRef.current) {
            // Placeholder histogram: sum of 3 random sines, static per component
            const { f, p } = fakeWaveRef.current;
            const s = (Math.sin(i * f[0] + p[0]) + Math.sin(i * f[1] + p[1]) + Math.sin(i * f[2] + p[2])) / 3;
            value = Math.pow((s + 1) / 2, 1.5) * 0.9 + 0.05;
         }
         const barHeight = Math.max(2, value * height);
         const x = i * (barWidth + gap);
         const played = (x + barWidth) / width <= progress;

         ctx.fillStyle = played ? "#d43c4a" : "#4b5563";
         ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
      }

      rafRef.current = requestAnimationFrame(draw);
   }, []);

   useEffect(() => {
      rafRef.current = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(rafRef.current);
   }, [draw]);

   useEffect(() => {
      return () => {
         audioCtxRef.current?.close().catch(() => { });
      };
   }, []);

   function setupAudioGraph() {
      if (audioCtxRef.current || !audioRef.current) return;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audioRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
   }

   async function togglePlay() {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
         try {
            setupAudioGraph();
            await audioCtxRef.current?.resume();
         } catch (e) {
            console.error("Failed to initialize audio context", e);
         }
         audio.play();
      } else {
         audio.pause();
      }
   }

   function handleSeek(e: React.MouseEvent<HTMLCanvasElement>) {
      const audio = audioRef.current;
      const canvas = canvasRef.current;
      if (!audio || !canvas) return;
      const knownDuration = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : durationRef.current;
      if (!knownDuration) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * knownDuration;
      setCurrentTime(audio.currentTime);
   }

   // Some responses don't include the total length, so the browser reports
   // duration as Infinity. Seeking far past the end forces it to resolve the
   // real duration, then we jump back to the start. While the fix is running,
   // the fake position must not leak into the displayed time.
   function resolveDuration(audio: HTMLAudioElement) {
      if (audio.duration === Infinity) {
         if (fixingDurationRef.current) return;
         fixingDurationRef.current = true;
         const reset = () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            clearTimeout(timeout);
            audio.currentTime = 0;
            fixingDurationRef.current = false;
            if (isFinite(audio.duration)) setDuration(audio.duration);
         };
         const onTimeUpdate = () => reset();
         // Safety net: if the seek never resolves, don't leave the clock frozen
         const timeout = setTimeout(reset, 5000);
         audio.addEventListener("timeupdate", onTimeUpdate);
         audio.currentTime = Number.MAX_SAFE_INTEGER;
         return;
      }
      if (isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
   }

   function handleDurationChange(e: React.SyntheticEvent<HTMLAudioElement>) {
      resolveDuration(e.currentTarget);
   }

   // Metadata may already be loaded before React attaches its event handlers
   // (e.g. cached file on refresh) — read the duration directly in that case.
   useEffect(() => {
      const audio = audioRef.current;
      if (audio && audio.readyState >= 1) resolveDuration(audio);
   }, []);

   function formatTime(seconds: number): string {
      if (!isFinite(seconds)) return "0:00";
      const total = Math.floor(seconds);
      const hours = Math.floor(total / 3600);
      const mins = Math.floor((total % 3600) / 60);
      const secs = total % 60;
      if (hours > 0) {
         return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
      return `${mins}:${secs.toString().padStart(2, "0")}`;
   }

   return (
      <div className="bg-[#1c1c1c] p-4 text-white drop-shadow-lg my-6 rounded-md">
         <div className="flex items-center gap-4">
            <button
               onClick={togglePlay}
               aria-label={isPlaying ? "Pause audio" : "Play audio"}
               className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-colors"
            >
               <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={isPlaying ? "" : "ml-1"} />
            </button>
            <h2 className="!text-[18px] font-semibold !m-0 truncate">{title}</h2>
         </div>
         <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-gray-400 min-w-[7ch] text-right tabular-nums">{formatTime(currentTime)}</span>
            <canvas
               ref={canvasRef}
               onClick={handleSeek}
               className="flex-1 min-w-0 w-full h-12 cursor-pointer"
               aria-label="Audio progress"
            />
            <span className="text-xs text-gray-400 min-w-[7ch] tabular-nums">{duration > 0 ? formatTime(duration) : ""}</span>
         </div>
         <audio
            ref={audioRef}
            src={src}
            crossOrigin="anonymous"
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={handleDurationChange}
            onDurationChange={handleDurationChange}
            onCanPlay={handleDurationChange}
            onTimeUpdate={(e) => {
               if (!fixingDurationRef.current) setCurrentTime(e.currentTarget.currentTime);
            }}
         />
      </div>
   );
}
