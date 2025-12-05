"use client"

import { useEmbeddedPlayer } from "./EmbeddedPlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faShareAlt as faShare } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState, useMemo } from "react";
import classNames from "classnames";
import Markdown from 'react-markdown'
import TlisImage from "@/components/TlisImage";

function calculateContrast(hexColor: string): string {
    if (!hexColor) return '#000000';
    const color = hexColor.replace('#', '');
    if (color.length !== 6) return '#000000';
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

function EmbeddedEpisode({ episode, ShowName }: { episode: any, ShowName: string }) {
    const { setMode, setArchiveName, setSrc, setArchiveEpisodeId, setArchiveMetadata, setArchiveShowName, setArchiveEpisodeCover, isPlaying, setIsPlaying, archiveEpisodeCover } = useEmbeddedPlayer();

    const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
    const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);
    const isCurrentEpisode = archiveEpisodeCover === episode.Cover;

    useEffect(() => {
        function checkOverflow() {
            if (descriptionRef.current) {
                setIsDescriptionOverflowing(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
            }
        }
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, []);

    function selectEpisode(episode: any) {
        setMode("archive");
        setArchiveName(episode.Title);
        setArchiveShowName(ShowName);
        setArchiveEpisodeCover(episode.Cover);
        setArchiveMetadata({
            author: ShowName,
            album: ShowName,
            image: episode.Cover
        });
        setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio}`);
        setArchiveEpisodeId(episode.id);
        setIsPlaying(true);
    }

    function shareEpisode(episode: any) {
        const baseUrl = window.location.origin;
        const embedUrl = `${baseUrl}/embedded?type=episode&id=${episode.id}`;
        if (navigator.share) {
            navigator.share({
                title: episode.Title,
                text: episode.Description?.slice(0, 100),
                url: embedUrl,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(embedUrl);
        }
    }

    return (
        <div className="bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/5">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-40 w-full flex-shrink-0 rounded-lg overflow-hidden shadow-md ring-2 ring-white/5">
                    <TlisImage
                        src={episode.Cover}
                        width={500}
                        height={500}
                        alt={episode.Title}
                        className="w-full h-auto object-cover"
                    />
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4 md:flex-row flex-col">
                        <div className="flex flex-col items-start flex-1">
                            {episode.Tags && episode.Tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {episode.Tags.map((tag: any) => (
                                        <span
                                            key={tag.Tags_id.id}
                                            style={{
                                                background: `${tag.Tags_id.Color}`,
                                                color: calculateContrast(tag.Tags_id.Color)
                                            }}
                                            className="text-xs font-medium px-2.5 py-1 rounded-full shadow-sm"
                                        >
                                            {tag.Tags_id.Title}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h2 className="text-xl font-semibold text-white mb-1">{episode.Title}</h2>
                            <p className="text-sm text-zinc-400">
                                {new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views} {episode.Views == 1 ? "vypočutie" : "vypočutí"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { shareEpisode(episode) }}
                                aria-label="Share episode"
                                className="w-11 h-11 flex items-center justify-center rounded-full bg-zinc-700/80 hover:bg-zinc-600 transition-all duration-200 shadow-md hover:shadow-lg">
                                <FontAwesomeIcon icon={faShare} className="text-white" />
                            </button>
                            {episode.Audio && episode.Audio !== "" && episode.Audio !== null && (
                                <button
                                    onClick={() => {
                                        if (isCurrentEpisode && isPlaying) {
                                            setIsPlaying(false);
                                        } else if (isCurrentEpisode) {
                                            setIsPlaying(true);
                                        } else {
                                            selectEpisode(episode);
                                        }
                                    }}
                                    className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d43c4a] to-[#b83744] hover:from-[#b83744] hover:to-[#9a2e39] transition-all duration-200 shadow-md hover:shadow-lg"
                                    aria-label={isCurrentEpisode && isPlaying ? "Pause episode" : "Play episode"}
                                >
                                    <FontAwesomeIcon icon={isCurrentEpisode && isPlaying ? faPause : faPlay} className={classNames("text-white", !isCurrentEpisode || !isPlaying ? "ml-0.5" : "")} />
                                </button>
                            )}
                        </div>
                    </div>

                    {episode.Description && (
                        <div className={classNames("relative mt-3", isDescriptionExpanded ? "pb-8" : "")}>
                            <div
                                ref={descriptionRef}
                                className={`text-sm text-zinc-300 ${isDescriptionExpanded ? "max-h-none" : "max-h-20"} overflow-hidden tlis-markdown`}
                            >
                                <Markdown>
                                    {episode.Description}
                                </Markdown>
                            </div>

                            {isDescriptionOverflowing && (
                                <div className="absolute w-full bottom-0">
                                    {!isDescriptionExpanded && (
                                        <div className="w-full absolute bottom-0 h-16 bg-gradient-to-b from-transparent to-zinc-900/90" />
                                    )}
                                    <button
                                        onClick={() => setDescriptionExpanded(!isDescriptionExpanded)}
                                        className="mt-2 text-xs font-bold underline absolute bottom-0 text-[#D43C4A] hover:text-[#b83744] transition-colors"
                                    >
                                        {isDescriptionExpanded ? "SKRYŤ" : "ZOBRAZIŤ VIAC"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EmbeddedEpisodeListView({ show, showTags, episodes, ShowName, totalCount }: { show: any, showTags: any, episodes: any, ShowName: string, totalCount: number }) {
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    function toggleTag(tagId: string) {
        setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    }

    const filteredEpisodes = useMemo(() => {
        if (!selectedTagIds || selectedTagIds.length === 0) return episodes;
        return episodes.filter((ep: any) => {
            if (!ep.Tags || ep.Tags.length === 0) return false;
            return ep.Tags.some((t: any) => selectedTagIds.includes(String(t.Tags_id?.id)));
        });
    }, [episodes, selectedTagIds]);

    return (
        <div className="w-full h-full max-h-screen overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Show header */}
                <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 backdrop-blur-sm p-5 rounded-xl shadow-xl border border-white/5">
                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                        <div className="w-24 sm:w-32 aspect-square flex-shrink-0 rounded-lg overflow-hidden shadow-md ring-2 ring-white/10">
                            <TlisImage
                                src={show.Cover}
                                width={200}
                                height={200}
                                alt={show.Title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="font-argentumSansBold text-3xl text-white mb-2">{show.Title}</h1>
                            <p className="text-sm text-zinc-400">Celkom {totalCount} {totalCount === 1 ? 'epizóda' : totalCount < 5 ? 'epizódy' : 'epizód'}</p>
                        </div>
                    </div>
                </div>

                {/* Tags filter */}
                {showTags && showTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {showTags.map((tag: any) => {
                            const tagId = tag.id ?? tag.Tags_id?.id ?? '';
                            const title = tag.Title ?? tag.Tags_id?.Title ?? '';
                            const color = tag.Color ?? tag.Tags_id?.Color ?? '';
                            const selected = selectedTagIds.includes(String(tagId));
                            return (
                                <button
                                    key={tagId}
                                    onClick={() => toggleTag(String(tagId))}
                                    aria-pressed={selected}
                                    style={{
                                        background: selected ? color : 'transparent',
                                        color: selected ? calculateContrast(color) : 'white',
                                        borderColor: color
                                    }}
                                    className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 border-2 hover:shadow-lg flex items-center gap-2"
                                >
                                    <div className="w-3 h-3 rounded-full" style={{
                                        backgroundColor: selected ? calculateContrast(color) : color
                                    }}></div>
                                    {title}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Episodes list */}
                <div className="space-y-4">
                    {filteredEpisodes.map((episode: any, index: number) => (
                        <EmbeddedEpisode episode={episode} key={index} ShowName={ShowName} />
                    ))}
                </div>
            </div>
        </div>
    );
}
