"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { EmbeddedPlayerProvider } from "./EmbeddedPlayerContext";
import EmbeddedShowView from "./EmbeddedShowView";
import EmbeddedEpisodeListView from "./EmbeddedEpisodeListView";
import EmbeddedEpisodeView from "./EmbeddedEpisodeView";
import CmsApiService from "@/services/cms-api-service";

function EmbeddedContent() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const type = searchParams?.get("type"); // 'show', 'episodes', 'episode'
    const id = searchParams?.get("id");
    const slug = searchParams?.get("slug");

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            setError(null);

            try {
                if (type === "show" && slug) {
                    // Load show info only
                    const show = await CmsApiService.Show.getShowBySlug(slug);
                    const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(String(show.id), 0);
                    setData({
                        type: "show",
                        show: episodeData.show,
                        totalCount: episodeData.totalCount,
                    });
                } else if (type === "episodes" && slug) {
                    // Load show with episode list
                    const show = await CmsApiService.Show.getShowBySlug(slug);
                    const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(String(show.id), 0);
                    const showTags = await CmsApiService.Show.getShowTagsById(String(show.id));
                    setData({
                        type: "episodes",
                        show: episodeData.show,
                        episodes: episodeData.episodes,
                        showTags,
                        totalCount: episodeData.totalCount,
                    });
                } else if (type === "episode" && id) {
                    // Load single episode
                    const episode = await CmsApiService.Show.getEpisodeById(parseInt(id));
                    setData({
                        type: "episode",
                        episode,
                    });
                } else {
                    setError("Invalid parameters. Please provide type and either slug or id.");
                }
            } catch (err) {
                console.error("Error loading data:", err);
                setError("Failed to load content.");
            } finally {
                setLoading(false);
            }
        }

        if (type) {
            loadData();
        } else {
            setError("Missing type parameter.");
            setLoading(false);
        }
    }, [type, id, slug]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-transparent">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 animate-spin text-[#D43C4A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <p className="mt-4 text-white font-argentumSansLight">Načítavam...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-transparent">
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/10">
                    <h2 className="text-2xl text-white mb-2 font-argentumSansBold">Chyba</h2>
                    <p className="text-zinc-400 font-argentumSansLight">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <EmbeddedPlayerProvider>
            <div className="w-full min-h-screen bg-transparent">
                {data?.type === "show" && (
                    <EmbeddedShowView show={data.show} totalCount={data.totalCount} />
                )}
                {data?.type === "episodes" && (
                    <EmbeddedEpisodeListView
                        show={data.show}
                        showTags={data.showTags}
                        episodes={data.episodes}
                        ShowName={data.show.Title}
                        totalCount={data.totalCount}
                    />
                )}
                {data?.type === "episode" && (
                    <EmbeddedEpisodeView episode={data.episode} />
                )}
            </div>
        </EmbeddedPlayerProvider>
    );
}

export default function EmbeddedPage() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center bg-transparent">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 animate-spin text-[#D43C4A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <p className="mt-4 text-white font-argentumSansLight">Načítavam...</p>
                </div>
            </div>
        }>
            <EmbeddedContent />
        </Suspense>
    );
}
