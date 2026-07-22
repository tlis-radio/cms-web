"use client";
import FilterBar from "@/components/dashboard/FilterBar";
import "./dashboard.css"
import {
  faArrowDown,
  faArrowUp,
  faStickyNote,
  faPlayCircle,
  faShare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/dist/client/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardAuth } from "@/context/DashboardAuthContext";
import { DashboardService } from "@/lib/dashboard/dashboard-service";
import { Show } from "@/models/show";
import { Episode } from "@/models/episode";
import { ListeningSession, ListeningSessionStream } from "@/types/statistics";

type TimeFilter = "all" | "12m" | "6m" | "3m" | "1m" | "7d";
type RetentionFilter = "archive" | "live";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const RETENTION_FALLBACK_DURATION = 3600;

function coverUrl(assetId?: string | null) {
  return `${DIRECTUS_URL}/assets/${assetId}`;
}

function formatDate(date?: string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("sk-SK");
}

function formatWatchTime(totalSeconds: number): string {
  if (totalSeconds < 60) return "0min";
  const hours = totalSeconds / 3600;
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  return `${Math.round(totalSeconds / 60)}min`;
}

// Bucket granularity scales with the selected period so the activity graph
// doesn't try to plot years of data as individual days.
function activityBucketKey(date: Date, timeFilter: TimeFilter): string {
  if (timeFilter === "7d" || timeFilter === "1m") {
    return date.toISOString().slice(0, 10); // day
  }
  if (timeFilter === "3m" || timeFilter === "6m") {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diffToMonday);
    return d.toISOString().slice(0, 10); // week start
  }
  return date.toISOString().slice(0, 7); // month
}

function initialsFor(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

type DashboardBulkData = {
  shows: Show[];
  episodes: Episode[];
  listeningSessions: ListeningSession[];
  listeningSessionsStream: ListeningSessionStream[];
};

type MemberInfo = {
  id: number;
  Name: string;
  Role: string;
  Picture?: string;
  Cast: { id: number; Name: string; Slug: string } | null;
};

function EpisodesList({ episodes }: { episodes: any[] }) {
  return (
    <div className="flex flex-col gap-3">
      {[
        {
          title: "Epizóda 1",
          length: "30 min",
          date: "12.06.2024",
          views: 100,
        },
        {
          title: "Epizóda 2",
          length: "45 min",
          date: "15.06.2024",
          views: 150,
        },
        {
          title: "Epizóda 3",
          length: "25 min",
          date: "18.06.2024",
          views: 200,
        },
      ].map((episode, index) => (
        <div key={index} className="flex items-center cursor-pointer">
          <div className="w-8 h-8">
            <img
              src={`https://picsum.photos/seed/${index}/256/256`}
              className="rounded-md w-full object-cover"
            />
          </div>
          <div className="flex flex-col ml-2">
            <span className="text-sm text-white">{episode.title}</span>
            <span className="text-xs text-gray-300">
              {episode.date} • {episode.length}
            </span>
          </div>
          <span className="text-lg text-gray-300 ml-auto">{episode.views}</span>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { directusClient, user } = useDashboardAuth();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [retentionFilter, setRetentionFilter] =
    useState<RetentionFilter>("archive");

  const service = useMemo(
    () => (directusClient ? new DashboardService(directusClient) : null),
    [directusClient],
  );

  const [dashboardData, setDashboardData] = useState<DashboardBulkData | null>(
    null,
  );
  const [trackShares, setTrackShares] = useState<
    Array<{
      id: number;
      episode: { id: number; title: string };
      name: string;
      date_created: string;
    }>
  >([]);

  // Member/Cast identity for the logged-in DirectusUser. Kept in local page
  // state only - never passed into shared/global context - so it can't leak
  // to anything outside the Dashboard.
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [myShows, setMyShows] = useState<
    Array<{ id: number; title: string; slug: string }>
  >([]);
  const [selectedMyShowIds, setSelectedMyShowIds] = useState<Set<number>>(
    new Set(),
  );

  // Cast member profile pictures, joined client-side by Cast id (Members has
  // no reverse relation to Cast, same as castEndpoints.getCastBySlug).
  const [pictureByCastId, setPictureByCastId] = useState<Map<number, string>>(
    new Map(),
  );

  const [selectedTopShowId, setSelectedTopShowId] = useState<number | null>(
    null,
  );

  const router = useRouter();

  // Bulk analytics data (shows/episodes/sessions) + track shares
  useEffect(() => {
    if (!directusClient || !service) return;
    let cancelled = false;

    service
      .getAllDashboardDataWithProgress(() => {})
      .then((data) => {
        if (!cancelled) setDashboardData(data);
      });
    service.getAllTrackShares().then((shares) => {
      if (!cancelled) setTrackShares(shares);
    });

    return () => {
      cancelled = true;
    };
  }, [directusClient, service]);

  // Resolve the logged-in user's Member/Cast identity and their shows
  useEffect(() => {
    if (!service || !user) return;
    let cancelled = false;

    service.getMemberForUser(user.id).then(async (m) => {
      if (cancelled) return;
      setMember(m);

      if (m?.Cast?.id) {
        const shows = await service.getShowsForCastId(m.Cast.id);
        if (!cancelled) {
          setMyShows(
            shows.map((s) => ({ id: s.id, title: s.Title, slug: s.Slug })),
          );
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [service, user]);

  // All Cast member profile pictures, for the Tvorcovia widget
  useEffect(() => {
    if (!service) return;
    let cancelled = false;
    service.getAllMembers().then((members) => {
      if (cancelled) return;
      const map = new Map<number, string>();
      members.forEach((m) => {
        if (m.Cast != null && m.Picture) map.set(m.Cast, m.Picture);
      });
      setPictureByCastId(map);
    });
    return () => {
      cancelled = true;
    };
  }, [service]);

  // Episodes have no real Show relation of their own - the real link is the
  // Shows.Episodes junction. Build both lookup directions from it once.
  const { episodesByShowId, showByEpisodeId } = useMemo(() => {
    if (!service || !dashboardData) {
      return {
        episodesByShowId: new Map<number, Episode[]>(),
        showByEpisodeId: new Map<string, Show>(),
      };
    }
    return service.buildShowEpisodeIndex(
      dashboardData.shows,
      dashboardData.episodes,
    );
  }, [service, dashboardData]);

  // Latest aired episode date for each of "my shows"
  const myShowsDisplay = useMemo(() => {
    return myShows.map((show) => {
      const latest = (episodesByShowId.get(show.id) || [])
        .slice()
        .sort(
          (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime(),
        )[0];
      return {
        ...show,
        date: latest ? formatDate(latest.Date) : "",
        isSelected: selectedMyShowIds.has(show.id),
      };
    });
  }, [myShows, episodesByShowId, selectedMyShowIds]);

  const timeFilterOptions: { value: TimeFilter; label: string }[] = [
    { value: "all", label: "Celé obdobie" },
    { value: "12m", label: "Posledných 12 mesiacov" },
    { value: "6m", label: "Posledných 6 mesiacov" },
    { value: "3m", label: "Posledné 3 mesiace" },
    { value: "1m", label: "Posledný mesiac" },
    { value: "7d", label: "Posledných 7 dní" },
  ];

  const periodStats = useMemo(() => {
    if (!dashboardData || !service) return null;

    const now = new Date();
    const start = service.getCutoffDate(timeFilter);
    const hasPrevPeriod = start !== null;
    const prevEnd = start;
    const prevStart = start
      ? new Date(start.getTime() - (now.getTime() - start.getTime()))
      : null;

    const inRange = (d: string, from: Date | null, to: Date | null) => {
      const t = new Date(d).getTime();
      if (from && t < from.getTime()) return false;
      if (to && t >= to.getTime()) return false;
      return true;
    };

    const episodesCount = dashboardData.episodes.filter((ep) =>
      inRange(ep.Date, start, null),
    ).length;
    const prevEpisodesCount = hasPrevPeriod
      ? dashboardData.episodes.filter((ep) =>
          inRange(ep.Date, prevStart, prevEnd),
        ).length
      : 0;

    const listenerSet = new Set<string>();
    const prevListenerSet = new Set<string>();
    [
      ...dashboardData.listeningSessions,
      ...dashboardData.listeningSessionsStream,
    ].forEach((s) => {
      if (inRange(s.date_created, start, null)) listenerSet.add(s.session_id);
      if (hasPrevPeriod && inRange(s.date_created, prevStart, prevEnd))
        prevListenerSet.add(s.session_id);
    });

    const sharesCount = trackShares.filter((s) =>
      inRange(s.date_created, start, null),
    ).length;
    const prevSharesCount = hasPrevPeriod
      ? trackShares.filter((s) => inRange(s.date_created, prevStart, prevEnd))
          .length
      : 0;

    const diff = (current: number, prev: number): number | null => {
      if (!hasPrevPeriod || prev === 0) return null;
      return ((current - prev) / prev) * 100;
    };

    return {
      episodesCount,
      episodesDiff: diff(episodesCount, prevEpisodesCount),
      listenersCount: listenerSet.size,
      listenersDiff: diff(listenerSet.size, prevListenerSet.size),
      sharesCount,
      sharesDiff: diff(sharesCount, prevSharesCount),
    };
  }, [dashboardData, trackShares, timeFilter, service]);

  const topStatCards = [
    {
      title: "Počet epizód",
      value: periodStats?.episodesCount ?? "...",
      diff: periodStats?.episodesDiff ?? null,
    },
    {
      title: "Počet poslucháčov",
      value: periodStats?.listenersCount ?? "...",
      diff: periodStats?.listenersDiff ?? null,
    },
    {
      title: "Počet zdielaní",
      value: periodStats?.sharesCount ?? "...",
      diff: periodStats?.sharesDiff ?? null,
    },
  ];

  const topByRetention = useMemo(() => {
    if (!service || !dashboardData) return [];
    return service.getTopShowsByRetention(
      {
        shows: dashboardData.shows,
        episodes: dashboardData.episodes,
        listeningSessions: dashboardData.listeningSessions,
      },
      timeFilter,
    );
  }, [service, dashboardData, timeFilter]);

  const topByStreamRetention = useMemo(() => {
    if (!service || !dashboardData) return [];
    return service.getTopShowsByStreamRetention(
      {
        shows: dashboardData.shows,
        episodes: dashboardData.episodes,
        listeningSessionsStream: dashboardData.listeningSessionsStream,
      },
      timeFilter,
    );
  }, [service, dashboardData, timeFilter]);

  const topByListeners = useMemo(() => {
    if (!service || !dashboardData) return [];
    return service.getTopShowsByListeners(
      {
        shows: dashboardData.shows,
        episodes: dashboardData.episodes,
        listeningSessions: dashboardData.listeningSessions,
        listeningSessionsStream: dashboardData.listeningSessionsStream,
      },
      timeFilter,
    );
  }, [service, dashboardData, timeFilter]);

  const topShowsList =
    retentionFilter === "archive" ? topByRetention : topByStreamRetention;
  const listenersByShowId = useMemo(() => {
    const map = new Map<number, number>();
    topByListeners.forEach((s) => map.set(s.show.id, s.listenerCount));
    return map;
  }, [topByListeners]);

  // Default to the top row so the retention graph isn't empty on load, and
  // re-pick whenever the current selection falls out of the (re-sorted/filtered) list.
  useEffect(() => {
    if (topShowsList.length === 0) return;
    const stillValid = topShowsList.some(
      (s) => s.show.id === selectedTopShowId,
    );
    if (!stillValid) setSelectedTopShowId(topShowsList[0].show.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topShowsList]);

  // Trending episodes by listen count within the selected period (archive +
  // live sessions), not the all-time Views counter.
  const trendingEpisodes = useMemo(() => {
    if (!dashboardData || !service) return [];
    const start = service.getCutoffDate(timeFilter);
    const now = Date.now();

    const listensByEpisodeId = new Map<string, number>();
    [...dashboardData.listeningSessions, ...dashboardData.listeningSessionsStream].forEach((s) => {
      if (start && new Date(s.date_created) < start) return;
      const key = String(s.episode_id);
      listensByEpisodeId.set(key, (listensByEpisodeId.get(key) || 0) + 1);
    });

    return dashboardData.episodes
      .filter((ep) => !ep.Date || new Date(ep.Date).getTime() <= now)
      .map((ep) => ({ episode: ep, listens: listensByEpisodeId.get(String(ep.id)) || 0 }))
      .filter((e) => e.listens > 0)
      .sort((a, b) => b.listens - a.listens)
      .slice(0, 3);
  }, [dashboardData, service, timeFilter]);

  // Recently aired episodes, globally (not scoped to the logged-in user)
  const recentEpisodes = useMemo(() => {
    if (!dashboardData) return [];
    const now = Date.now();
    return [...dashboardData.episodes]
      .filter((ep) => !ep.Date || new Date(ep.Date).getTime() <= now)
      .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
      .slice(0, 3);
  }, [dashboardData]);

  // Creators (Cast members) ranked by total listener watch time (archive +
  // live) within the selected period - the headline number on the right.
  const topCreators = useMemo(() => {
    if (!dashboardData || !service) return [];

    const stats = new Map<
      number,
      { name: string; episodeIds: Set<string>; views: number }
    >();
    dashboardData.shows.forEach((show) => {
      const showEpisodes = episodesByShowId.get(show.id) || [];
      (show.Cast || []).forEach((c: any) => {
        const castId = c.Cast_id?.id ?? c.Cast_id;
        const castName = c.Cast_id?.Name;
        if (!castId || !castName) return;
        const entry = stats.get(castId) || {
          name: castName,
          episodeIds: new Set<string>(),
          views: 0,
        };
        showEpisodes.forEach((ep) => {
          entry.episodeIds.add(String(ep.id));
          entry.views += ep.Views || 0;
        });
        stats.set(castId, entry);
      });
    });

    const start = service.getCutoffDate(timeFilter);

    return Array.from(stats.entries())
      .map(([castId, e]) => {
        const watchSeconds = [
          ...dashboardData.listeningSessions,
          ...dashboardData.listeningSessionsStream,
        ]
          .filter(
            (s) =>
              e.episodeIds.has(String(s.episode_id)) &&
              (!start || new Date(s.date_created) >= start),
          )
          .reduce(
            (sum, s) =>
              sum +
              service.calculateListeningDuration(
                s.segments || [],
                RETENTION_FALLBACK_DURATION,
              ).duration,
            0,
          );
        return {
          name: e.name,
          episodes: e.episodeIds.size,
          views: e.views,
          watchSeconds,
          Picture: pictureByCastId.get(castId),
        };
      })
      .filter((c) => c.watchSeconds > 0)
      .sort((a, b) => b.watchSeconds - a.watchSeconds)
      .slice(0, 3);
  }, [dashboardData, service, episodesByShowId, pictureByCastId, timeFilter]);

  const handleGoToEpisode = (episode: Episode) => {
    const show = showByEpisodeId.get(String(episode.id));
    if (show) router.push(`/dashboard/shows/${show.Slug}/${episode.id}`);
  };

  // Global active-listener activity for the selected period - not tied to any
  // episode/show selection, bucketed to fit the chosen timeframe, split by
  // archive vs live so both show up as separate lines.
  const listenerActivityData = useMemo(() => {
    if (!dashboardData || !service) return [];
    const start = service.getCutoffDate(timeFilter);

    const archiveBuckets = new Map<string, number>();
    const liveBuckets = new Map<string, number>();

    dashboardData.listeningSessions.forEach((s) => {
      const d = new Date(s.date_created);
      if (start && d < start) return;
      const key = activityBucketKey(d, timeFilter);
      archiveBuckets.set(key, (archiveBuckets.get(key) || 0) + 1);
    });
    dashboardData.listeningSessionsStream.forEach((s) => {
      const d = new Date(s.date_created);
      if (start && d < start) return;
      const key = activityBucketKey(d, timeFilter);
      liveBuckets.set(key, (liveBuckets.get(key) || 0) + 1);
    });

    const allKeys = new Set([...archiveBuckets.keys(), ...liveBuckets.keys()]);
    return Array.from(allKeys)
      .sort()
      .map((time) => ({
        time,
        archive: archiveBuckets.get(time) || 0,
        live: liveBuckets.get(time) || 0,
      }));
  }, [dashboardData, service, timeFilter]);

  // Aggregate retention curve for a Top-show row, matching the archive/live toggle
  const topShowRetentionData = useMemo(() => {
    if (!service || selectedTopShowId == null) return [];
    const showEpisodeIds = new Set(
      (episodesByShowId.get(selectedTopShowId) || []).map((ep) =>
        String(ep.id),
      ),
    );
    if (!dashboardData) return [];

    if (retentionFilter === "archive") {
      const sessions = dashboardData.listeningSessions.filter((s) =>
        showEpisodeIds.has(String(s.episode_id)),
      );
      return service.calculateRetentionData(
        sessions,
        RETENTION_FALLBACK_DURATION,
      );
    }
    const sessions = dashboardData.listeningSessionsStream.filter((s) =>
      showEpisodeIds.has(String(s.episode_id)),
    );
    return service.calculateStreamRetentionData(
      sessions,
      RETENTION_FALLBACK_DURATION,
    );
  }, [
    service,
    dashboardData,
    episodesByShowId,
    selectedTopShowId,
    retentionFilter,
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-4 xl:flex-row flex-col">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 flex-col md:flex-row">
            {topStatCards.map((show, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col bg-[#96120F] border-500 rounded-lg p-4 text-white gap-3"
              >
                <div className="flex gap-1 mr-4 justify-between items-center w-full">
                  <div className="rounded-md bg-[#d43c4ae6] p-2 aspect-square flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faStickyNote}
                      width={18}
                      height={18}
                    />
                  </div>
                  {show.diff !== null && (
                    <div className="flex gap-3 items-center text-sm font-thin">
                      <FontAwesomeIcon
                        icon={show.diff > 0 ? faArrowUp : faArrowDown}
                      />
                      <span>{Math.round(show.diff)}%</span>
                    </div>
                  )}
                </div>
                <span className="flex flex-col">
                  <span className="text-sm font-thin">{show.title}</span>
                  <span className="text-lg font-bold">{show.value}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {timeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeFilter(option.value)}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  timeFilter === option.value
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 bg-black/20 p-4 rounded-md text-white">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-md font-bold text-white">
                Aktivita poslucháčov
              </span>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={listenerActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="archive"
                    stroke="#F59E0B"
                    name="Aktívni poslucháči (archív)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="live"
                    stroke="#EF4444"
                    name="Aktívni poslucháči (live)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col  gap-3 bg-black/20 p-4 rounded-md text-white">
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-md font-bold text-white">
                Top relácie podľa priemernej udržateľnosti
              </span>
              <span
                className="ml-auto cursor-pointer px-3 py-1.5 text-xs rounded-lg transition bg-gray-800 text-gray-300 hover:bg-gray-700"
                onClick={() =>
                  setRetentionFilter(
                    retentionFilter === "archive" ? "live" : "archive",
                  )
                }
              >
                {retentionFilter === "archive" ? "Live" : "Archívne"}
              </span>
            </div>
            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
              <div className="flex flex-col lg:max-h-[240px] overflow-y-auto gap-3 min-w-[300px] pr-4 dashboard-scrollbar max-md:row-start-2">
                {topShowsList.map((stat) => (
                  <div
                    key={stat.show.id}
                    className={`flex items-center cursor-pointer ${stat.show.id === selectedTopShowId ? "opacity-100" : "opacity-80"}`}
                    onClick={() => setSelectedTopShowId(stat.show.id)}
                  >
                    <div className="w-10 h-10 flex-shrink-0">
                      <img
                        src={coverUrl(stat.show.Cover)}
                        className="rounded-md w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-8 items-center w-full min-w-0">
                      <div className="flex flex-col ml-2 truncate">
                        <span className="text-sm text-white truncate">
                          {stat.show.Title}
                        </span>
                        <span className="text-xs text-gray-300">
                          {stat.episodeCount} epizód •{" "}
                          {listenersByShowId.get(stat.show.id) ?? 0} poslucháčov
                        </span>
                      </div>
                      <span className="text-lg text-gray-300 ml-auto">
                        {stat.avgRetention.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
                {topShowsList.length === 0 && (
                  <div className="text-sm text-gray-300">
                    Žiadne dáta pre toto obdobie
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 w-full">
                {selectedTopShowId != null ? (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={topShowRetentionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="time" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1F2937",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#fff" }}
                          formatter={
                            ((value: any) => [`${value}%`, "Udržanie"]) as any
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="retention"
                          stroke={
                            retentionFilter === "archive"
                              ? "#F59E0B"
                              : "#EF4444"
                          }
                          name="Udržanie"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[240px] text-sm text-gray-300">
                    Kliknite na reláciu pre zobrazenie grafu
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 text-white">
            <div className="flex w-full flex-col gap-2 bg-black/20 p-4 rounded-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-white">
                  Trendy epizódy podľa vypočutí
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {trendingEpisodes.map(({ episode, listens }) => (
                  <div
                    key={episode.id}
                    className="flex items-center cursor-pointer"
                    onClick={() => handleGoToEpisode(episode)}
                  >
                    <div className="w-8 h-8">
                      <img
                        src={coverUrl(episode.Cover)}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-sm text-white text-ellipsis overflow-hidden whitespace-nowrap max-w-[300px]">
                        {episode.Title}
                      </span>
                      <span className="text-xs text-gray-300">
                        {formatDate(episode.Date)} •{" "}
                        {showByEpisodeId.get(String(episode.id))?.Title}
                      </span>
                    </div>
                    <span className="text-lg text-gray-300 ml-auto">
                      {listens}
                    </span>
                  </div>
                ))}
                {trendingEpisodes.length === 0 && (
                  <div className="text-sm text-gray-300">Žiadne dáta</div>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 bg-black/20 p-4 rounded-md">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-white">Tvorcovia podľa času počúvania</span>
              </div>
              <div className="flex flex-col gap-3">
                {topCreators.map((creator, index) => (
                  <div key={index} className="flex items-center cursor-pointer">
                    <div className="w-8 h-8">
                      <img
                        src={coverUrl(creator.Picture)}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-sm text-white">{creator.name}</span>
                      <span className="text-xs text-gray-300">
                        {creator.episodes} epizód • {creator.views} views
                      </span>
                    </div>
                    <span className="text-lg text-gray-300 ml-auto">
                      {formatWatchTime(creator.watchSeconds)}
                    </span>
                  </div>
                ))}
                {topCreators.length === 0 && (
                  <div className="text-sm text-gray-300">Žiadne dáta</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex xl:flex-col lg:flex-row flex-col gap-4 xl:w-[450px] w-full">
          <div className="bg-black/20 p-4 rounded-md flex flex-col gap-4 w-full">
            <div>
              <div className="flex gap-4 items-center">
                {member?.Picture ? (
                  <img
                    src={coverUrl(member.Picture)}
                    className="rounded-full w-12 h-12 object-cover"
                  />
                ) : (
                  <div className="rounded-full bg-[#96120F] p-4 text-white">
                    {initialsFor(
                      member?.Name ||
                        `${user?.first_name ?? ""} ${user?.last_name ?? ""}`,
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm text-white font-thin">
                    {member?.Name ||
                      [user?.first_name, user?.last_name]
                        .filter(Boolean)
                        .join(" ") ||
                      user?.email}
                  </span>
                  <span className="text-xs text-gray-300">{member?.Role}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4 bg-black/20 p-4 rounded-md">
                <span className="text-md font-bold text-white">
                  Moje relácie
                </span>
                <div className="flex flex-col gap-2">
                  {myShowsDisplay.map((show) => (
                    // todo for each show fetch the slug too
                    <Link
                      href={`/dashboard/shows/${show.slug}`}
                      key={show.id}
                      className=""
                    >
                      <div
                        key={show.id}
                        className="flex justify-between items-center cursor-pointer gap-4"
                      >
                        <span className="text-sm text-white">{show.title}</span>
                        <span className="text-xs text-gray-300">
                          {show.date}
                        </span>
                        {/* todo last released episode from that show */}
                      </div>
                    </Link>
                  ))}
                  {myShowsDisplay.length === 0 && (
                    <span className="text-xs text-gray-300">
                      Žiadne priradené relácie
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-black/20 p-4 rounded-md flex flex-col gap-4 w-full">
            <div className="flex flex-col mt-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-md font-bold text-white">
                  Posledné epizódy
                </span>
                <Link
                  href="/dashboard/shows"
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  Zobraziť všetky
                </Link>
              </div>
              <div className="flex flex-col gap-3 mt-4 bg-black/20 p-4 rounded-md">
                {recentEpisodes.map((episode) => (
                  <div
                    key={episode.id}
                    className="flex items-center cursor-pointer"
                    onClick={() => handleGoToEpisode(episode)}
                  >
                    <div className="w-14 h-14">
                      <img
                        src={coverUrl(episode.Cover)}
                        className="rounded-md w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span className="text-sm text-white">
                        {episode.Title}
                      </span>
                      <span className="text-xs text-gray-300">
                        {formatDate(episode.Date)} •{" "}
                        {showByEpisodeId.get(String(episode.id))?.Title}
                      </span>
                      <div className="flex gap-2 items-center mt-1">
                        <FontAwesomeIcon
                          icon={faPlayCircle}
                          width={16}
                          height={16}
                          className="text-gray-300"
                        />
                        <span className="text-xs text-gray-300">
                          {episode.Views || 0}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <FontAwesomeIcon
                        icon={faShare}
                        width={16}
                        height={16}
                        className="text-gray-300 hover:text-[#d43c4ae6]"
                      />
                    </div>
                  </div>
                ))}
                {recentEpisodes.length === 0 && (
                  <span className="text-xs text-gray-300">Žiadne epizódy</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
