"use client";

import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";

type AudioTarget = MutableRefObject<HTMLAudioElement | null> | HTMLAudioElement | null;

interface CachedAudioGraph {
  context: AudioContext;
  analyser: AnalyserNode;
  source: MediaElementAudioSourceNode;
}

const audioGraphCache = new WeakMap<HTMLAudioElement, CachedAudioGraph>();

export interface BeatGifSyncPoint {
  id: number;
  beatTimeSeconds: number;
  gifTimestampSeconds: number;
  animationDelaySeconds: number;
}

export interface UseBeatSyncedGifOptions {
  audioTarget: AudioTarget;
  enabled?: boolean;
  selectedBpm?: number | null;
  minBpm?: number;
  maxBpm?: number;
  beatCooldownMs?: number;
  beatSensitivity?: number;
  fluxHistoryWindowSeconds?: number;
  bpmSmoothing?: number;
  gifBeatTimestampsSeconds: number[];
  gifLoopDurationSeconds: number;
  minPlaybackRate?: number;
  maxPlaybackRate?: number;
}

export type UseCurrentPlayerBeatSyncedGifOptions = Omit<UseBeatSyncedGifOptions, "audioTarget">;

export interface BeatSyncedGifState {
  status: "idle" | "waiting-for-audio" | "running" | "unsupported";
  analyzedBpm: number | null;
  bpm: number | null;
  bps: number | null;
  confidence: number;
  playbackRate: number;
  beatProgress: number;
  lastBeatAtSeconds: number | null;
  beatPulseId: number;
  syncPoint: BeatGifSyncPoint | null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getAudioElement(target: AudioTarget): HTMLAudioElement | null {
  if (!target) return null;
  if ("current" in target) return target.current;
  return target;
}

function normalizeGifBeatTimestamps(
  timestamps: number[],
  gifLoopDurationSeconds: number
): number[] {
  const safeLoop = Number.isFinite(gifLoopDurationSeconds) ? gifLoopDurationSeconds : 0;
  if (safeLoop <= 0) return [];

  return [...new Set(
    timestamps
      .filter((value) => Number.isFinite(value) && value >= 0 && value <= safeLoop)
      .map((value) => Number(value.toFixed(4)))
  )].sort((a, b) => a - b);
}

function estimateGifBaseBps(timestamps: number[], gifLoopDurationSeconds: number): number {
  if (timestamps.length === 0 || gifLoopDurationSeconds <= 0) return 1;
  if (timestamps.length === 1) return 1 / gifLoopDurationSeconds;

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i += 1) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  intervals.push(gifLoopDurationSeconds - timestamps[timestamps.length - 1] + timestamps[0]);

  const valid = intervals.filter((interval) => interval > 0);
  if (valid.length === 0) return 1;

  const avgInterval = valid.reduce((sum, interval) => sum + interval, 0) / valid.length;
  if (avgInterval <= 0) return 1;
  return 1 / avgInterval;
}

function estimateBpmFromBeatTimes(
  beatTimes: number[],
  minBpm: number,
  maxBpm: number
): { bpm: number | null; confidence: number } {
  if (beatTimes.length < 4) {
    return { bpm: null, confidence: 0 };
  }

  const candidates: number[] = [];
  for (let i = 1; i < beatTimes.length; i += 1) {
    const delta = beatTimes[i] - beatTimes[i - 1];
    if (delta <= 0) continue;

    let bpm = 60 / delta;
    while (bpm < minBpm) bpm *= 2;
    while (bpm > maxBpm) bpm /= 2;

    if (bpm >= minBpm && bpm <= maxBpm) {
      candidates.push(bpm);
    }
  }

  if (candidates.length === 0) {
    return { bpm: null, confidence: 0 };
  }

  const buckets = new Map<number, number>();
  candidates.forEach((candidate) => {
    const bucket = Math.round(candidate);
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  });

  let bestBucket = 0;
  let bestCount = -1;
  buckets.forEach((count, bucket) => {
    if (count > bestCount) {
      bestBucket = bucket;
      bestCount = count;
    }
  });

  return {
    bpm: bestBucket,
    confidence: candidates.length > 0 ? bestCount / candidates.length : 0,
  };
}

function getOrCreateAudioGraph(audio: HTMLAudioElement): CachedAudioGraph | null {
  const cached = audioGraphCache.get(audio);
  if (cached && cached.context.state !== "closed") {
    return cached;
  }

  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) {
    return null;
  }

  const context = new AudioContextCtor();
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.82;

  const source = context.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(context.destination);

  const graph = { context, analyser, source };
  audioGraphCache.set(audio, graph);
  return graph;
}

export function useBeatSyncedGif({
  audioTarget,
  enabled = true,
  selectedBpm = null,
  minBpm = 70,
  maxBpm = 180,
  beatCooldownMs = 220,
  beatSensitivity = 1.35,
  fluxHistoryWindowSeconds = 6,
  bpmSmoothing = 0.2,
  gifBeatTimestampsSeconds,
  gifLoopDurationSeconds,
  minPlaybackRate = 0.55,
  maxPlaybackRate = 2.3,
}: UseBeatSyncedGifOptions): BeatSyncedGifState {
  const [status, setStatus] = useState<BeatSyncedGifState["status"]>("idle");
  const [analyzedBpm, setAnalyzedBpm] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [lastBeatAtSeconds, setLastBeatAtSeconds] = useState<number | null>(null);
  const [beatPulseId, setBeatPulseId] = useState(0);
  const [beatProgress, setBeatProgress] = useState(0);
  const [syncPoint, setSyncPoint] = useState<BeatGifSyncPoint | null>(null);
  const [audioRetry, setAudioRetry] = useState(0);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const previousSpectrumRef = useRef<Uint8Array | null>(null);
  const fluxHistoryRef = useRef<Array<{ t: number; flux: number }>>([]);
  const beatTimesRef = useRef<number[]>([]);
  const lastBeatRef = useRef<number>(-Infinity);
  const smoothedBpmRef = useRef<number | null>(null);
  const syncIndexRef = useRef<number>(0);
  const beatPulseRef = useRef<number>(0);
  const beatProgressRef = useRef<number>(0);

  const normalizedTimestamps = useMemo(
    () => normalizeGifBeatTimestamps(gifBeatTimestampsSeconds, gifLoopDurationSeconds),
    [gifBeatTimestampsSeconds, gifLoopDurationSeconds]
  );

  const gifBaseBps = useMemo(
    () => estimateGifBaseBps(normalizedTimestamps, gifLoopDurationSeconds),
    [normalizedTimestamps, gifLoopDurationSeconds]
  );

  const bpm = selectedBpm ?? analyzedBpm;
  const bps = bpm ? bpm / 60 : null;

  const playbackRate = useMemo(() => {
    if (!bps || gifBaseBps <= 0) return 1;
    return clamp(bps / gifBaseBps, minPlaybackRate, maxPlaybackRate);
  }, [bps, gifBaseBps, minPlaybackRate, maxPlaybackRate]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }

    const audio = getAudioElement(audioTarget);
    if (!audio) {
      setStatus("waiting-for-audio");
      const pollId = window.setInterval(() => {
        if (getAudioElement(audioTarget)) {
          setAudioRetry((n) => n + 1);
          window.clearInterval(pollId);
        }
      }, 200);
      return () => window.clearInterval(pollId);
    }

    const graph = getOrCreateAudioGraph(audio);
    if (!graph) {
      setStatus("unsupported");
      return;
    }

    analyserRef.current = graph.analyser;
    audioContextRef.current = graph.context;
    sourceRef.current = graph.source;
    setStatus("running");

    const frequencyData = new Uint8Array(graph.analyser.frequencyBinCount);

    const frame = () => {
      rafRef.current = requestAnimationFrame(frame);
      if (!audioContextRef.current || !analyserRef.current) return;

      const now = performance.now() / 1000;
      const cooldownSeconds = beatCooldownMs / 1000;

      if (!audio.paused && audioContextRef.current.state === "suspended") {
        void audioContextRef.current.resume();
      }

      analyserRef.current.getByteFrequencyData(frequencyData);

      if (!previousSpectrumRef.current || previousSpectrumRef.current.length !== frequencyData.length) {
        previousSpectrumRef.current = new Uint8Array(frequencyData);
      }

      let flux = 0;
      for (let i = 0; i < frequencyData.length; i += 1) {
        const delta = frequencyData[i] - previousSpectrumRef.current[i];
        if (delta > 0) flux += delta;
        previousSpectrumRef.current[i] = frequencyData[i];
      }

      fluxHistoryRef.current.push({ t: now, flux });
      fluxHistoryRef.current = fluxHistoryRef.current.filter(
        (item) => now - item.t <= fluxHistoryWindowSeconds
      );

      const history = fluxHistoryRef.current;
      const avgFlux = history.reduce((sum, item) => sum + item.flux, 0) / Math.max(1, history.length);
      const variance =
        history.reduce((sum, item) => {
          const diff = item.flux - avgFlux;
          return sum + diff * diff;
        }, 0) / Math.max(1, history.length);
      const threshold = avgFlux + Math.sqrt(variance) * beatSensitivity;

      const beatDetected = !audio.paused && flux > threshold && now - lastBeatRef.current > cooldownSeconds;
      if (beatDetected) {
        lastBeatRef.current = now;
        setLastBeatAtSeconds(now);

        beatTimesRef.current.push(now);
        beatTimesRef.current = beatTimesRef.current.filter((time) => now - time <= 12);

        const estimate = estimateBpmFromBeatTimes(beatTimesRef.current, minBpm, maxBpm);
        setConfidence(estimate.confidence);

        if (estimate.bpm) {
          const previous = smoothedBpmRef.current;
          const smoothed = previous
            ? previous * (1 - bpmSmoothing) + estimate.bpm * bpmSmoothing
            : estimate.bpm;
          smoothedBpmRef.current = smoothed;
          setAnalyzedBpm(Number(smoothed.toFixed(2)));
        }

        beatPulseRef.current += 1;
        setBeatPulseId(beatPulseRef.current);

        if (normalizedTimestamps.length > 0) {
          const currentSyncIndex = syncIndexRef.current % normalizedTimestamps.length;
          const gifTimestamp = normalizedTimestamps[currentSyncIndex];
          syncIndexRef.current += 1;

          const bpmForSync = selectedBpm ?? smoothedBpmRef.current ?? estimate.bpm;
          const bpsForSync = bpmForSync ? bpmForSync / 60 : null;
          const rateForSync = bpsForSync
            ? clamp(bpsForSync / gifBaseBps, minPlaybackRate, maxPlaybackRate)
            : 1;

          setSyncPoint({
            id: beatPulseRef.current,
            beatTimeSeconds: now,
            gifTimestampSeconds: gifTimestamp,
            animationDelaySeconds: -(gifTimestamp / Math.max(rateForSync, 0.001)),
          });
        }
      }

      const effectiveBpm = selectedBpm ?? smoothedBpmRef.current;
      if (!effectiveBpm || !Number.isFinite(effectiveBpm) || !Number.isFinite(lastBeatRef.current)) {
        if (beatProgressRef.current !== 0) {
          beatProgressRef.current = 0;
          setBeatProgress(0);
        }
        return;
      }

      const beatInterval = 60 / effectiveBpm;
      if (beatInterval <= 0) return;

      const progressRaw = (now - lastBeatRef.current) / beatInterval;
      const progress = progressRaw - Math.floor(progressRaw);
      if (Math.abs(progress - beatProgressRef.current) > 0.02) {
        beatProgressRef.current = progress;
        setBeatProgress(progress);
      }
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = null;

      sourceRef.current = null;
      analyserRef.current = null;
      previousSpectrumRef.current = null;
      fluxHistoryRef.current = [];
      beatTimesRef.current = [];
      smoothedBpmRef.current = null;
      lastBeatRef.current = -Infinity;
      audioContextRef.current = null;

      setStatus("idle");
    };
  }, [
    audioRetry,
    audioTarget,
    beatCooldownMs,
    beatSensitivity,
    bpmSmoothing,
    enabled,
    fluxHistoryWindowSeconds,
    gifBaseBps,
    maxBpm,
    maxPlaybackRate,
    minBpm,
    minPlaybackRate,
    normalizedTimestamps,
    selectedBpm,
  ]);

  return {
    status,
    analyzedBpm,
    bpm,
    bps,
    confidence,
    playbackRate,
    beatProgress,
    lastBeatAtSeconds,
    beatPulseId,
    syncPoint,
  };
}

export function useCurrentPlayerBeatSyncedGif(
  options: UseCurrentPlayerBeatSyncedGifOptions
): BeatSyncedGifState {
  const { audioRef } = usePlayer();
  return useBeatSyncedGif({ ...options, audioTarget: audioRef });
}
