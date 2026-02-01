"use client"

import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faShareAlt as faShare, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState, useMemo } from "react";
import classNames from "classnames";
import Markdown from 'react-markdown'
import TlisImage from "@/components/TlisImage";
import Link from "next/link";
import { ShowCast } from "@/types/show";
import Pagination from "@/components/pagination/Pagination";
import { SHOWS_PAGE_SIZE } from "@/services/cms-api-service";

function calculateContrast(hexColor: string): string {
    if (!hexColor) return '#000000';
    // Remove the hash symbol if present
    const color = hexColor.replace('#', '');

    // Guard for short-hand or invalid values
    if (color.length !== 6) return '#000000';

    // Convert the hex color to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calculate the brightness of the color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black or white depending on the brightness
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

function Episode({ episode, ShowName }: { episode: any, ShowName: string }) {
    const { setMode, setArchiveName, setSrc, setArchiveEpisodeId, setArchiveMetadata, setArchiveShowName, setArchiveEpisodeCover } = usePlayer();

    const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
    const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

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
        setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio?.id || episode.Audio}`);
        setArchiveEpisodeId(episode.id);
    }

    function shareEpisode(episode: any) {
        if (navigator.share) {
            navigator.share({
                title: episode.Title,
                text: episode.Description?.slice(0, 100),
                url: window.location.href + `?sharedEpisode=${episode.id}`,
            }).catch(() => { });
        } else {
            const url = window.location.href + `?sharedEpisode=${episode.id}`;
            navigator.clipboard.writeText(url);
        }
    }


    return <div className="border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-48 w-full flex-shrink-0">
                <TlisImage
                    preview
                    src={episode.Cover}
                    width={500}
                    height={500}
                    alt={episode.Title}
                    className="w-full h-auto sm:flex-shrink-0 object-contain"
                />
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 md:flex-row flex-col mt-0 md:mt-2">
                    <div className="flex flex-col items-start">
                        {episode.Tags && episode.Tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {episode.Tags.map((tag: any) => (
                                    <span
                                        key={tag.Tags_id.id}
                                        style={{
                                            background: `${tag.Tags_id.Color}`,
                                            color: calculateContrast(tag.Tags_id.Color)
                                        }}
                                        className="text-xs font-medium px-2 py-1 rounded"
                                    >
                                        {tag.Tags_id.Title}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h2 className="text-2xl font-semibold flex-1 text-left">{episode.Title}</h2>
                        <p>{new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views} {episode.Views == 1 ? "vypočutie" : "vypočutí"}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                        <button
                            onClick={() => { shareEpisode(episode) }}
                            aria-label="Share episode"
                            className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                        {episode.Audio && episode.Audio.id && (
                            <button
                                onClick={() => {
                                    selectEpisode(episode);
                                }}
                                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-colors"
                                aria-label="Play episode"
                            >
                                <FontAwesomeIcon icon={faPlay} className="ml-1" />
                            </button>)}
                    </div>
                </div>

                <div className={classNames("relative", isDescriptionExpanded ? "pb-10" : "")}>
                    <div
                        ref={descriptionRef}
                        className={`mt-4 ${isDescriptionExpanded ? "max-h-none" : (episode.Tags.length > 0 ? "max-h-20" : "max-h-28")} overflow-hidden text-justify tlis-markdown`}
                    >
                        <Markdown   components={{
                            ol: ({ children, start }) => <p>{start}. {children}</p>,
                            li: ({ children }) => <span>{children} </span>,
                        }}>
                            {episode.Description}
                        </Markdown>
                    </div>

                    {isDescriptionOverflowing && (
                        <div className="absolute w-full bottom-0">
                            {!isDescriptionExpanded && (
                                <div className="w-full absolute bottom-0 h-20 bg-gradient-to-b from-transparent to-[#1C1C1C]" />
                            )}
                            <button
                                onClick={() => setDescriptionExpanded(!isDescriptionExpanded)}
                                className={"mt-2 font-bold underline absolute bottom-0 -translate-x-1/2 text-[#D43C4A]"}
                            >
                                {isDescriptionExpanded ? "SKRYŤ" : "ZOBRAZIŤ VIAC"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>

}

export default function Shows({ show, showTags, episodes, ShowName, totalCount, currentPage }: { show: any, showTags: any, episodes: any, ShowName: string, totalCount: number, currentPage: number }) {
    // selected tag ids (stringified) used for filtering episodes
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    function toggleTag(tagId: string) {
        setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
    }

    function clearTagFilters() {
        setSelectedTagIds([]);
    }

    const filteredEpisodes = useMemo(() => {
        if (!selectedTagIds || selectedTagIds.length === 0) return episodes;
        return episodes.filter((ep: any) => {
            if (!ep.Tags || ep.Tags.length === 0) return false;
            return ep.Tags.some((t: any) => selectedTagIds.includes(String(t.Tags_id?.id)));
        });
    }, [episodes, selectedTagIds]);

    const totalPages = Math.ceil(totalCount / SHOWS_PAGE_SIZE);

    return (
        <div className="font-argentumSansBold mb-[80px] flex flex-col w-full justify-center md:mb-0">
            <Link href="/relacie" className="w-full text-white text-left px-2 mb-4 flex gap-2 justify-center items-center">
                <FontAwesomeIcon icon={faChevronLeft} className="w-4" /><p>ZOBRAZIŤ VŠETKY RELÁCIE</p>
            </Link>
            <div className="w-full z-10 px-2">
                <div className="flex flex-col gap-4 border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
                    <div className="border-b pb-4">
                        <div className="flex flex-col gap-6 md:flex-row">
                            <div className="md:w-52 w-full aspect-square flex-shrink-0">
                                <TlisImage
                                    preview
                                    src={show.Cover}
                                    width={500}
                                    height={500}
                                    alt={show.Title}
                                    className="md:h-52"
                                />
                            </div>
                            <div className="m-auto flex h-max w-full flex-col gap-4">
                                <h1 className="font-argentumSansBold text-6xl">{show.Title}</h1>
                                <p className="font-argentumSansLight flex flex-wrap gap-1 justify-center w-full"> Redaktori:
                                    <b className="flex flex-wrap gap-1">
                                    {show.Cast.map((castMember: ShowCast, index: number) => (
                                        <span key={index}>
                                            <Link 
                                                href={`/ucinkujuci/${castMember.Cast_id.Slug}`}
                                                className="hover:text-[#d43c4a] transition-colors underline decoration-dotted"
                                            >
                                                {castMember.Cast_id.Name}
                                            </Link>
                                            {index < show.Cast.length - 1 ? ' / ' : ''}
                                        </span>
                                    ))}</b>
                                </p>
                                <p className="font-argentumSansLight">Počet epizód: <b>{totalCount}</b></p>
                            </div>
                        </div>
                    </div>
                    <div className="font-argentumSansLight flex flex-col h-full gap-4">
                        <Markdown   components={{
                            ol: ({ children, start }) => <p>{start}.{children}</p>,
                            li: ({ children }) => <span>{children} </span>,
                        }}>
                            {show.Description}
                        </Markdown>
                    </div>
                </div>

                <div className="font-argentumSansLight mb-8">
                    {showTags && showTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 py-4">
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
                                             color: selected?  calculateContrast(color): 'white',
                                             borderColor: color
                                        }}
                                        className={classNames("text-sm font-medium px-3 py-1 rounded-full transition-colors focus:outline-none flex items-center gap-2 border-2")}
                                    >
                                        <div className="w-4 h-4 rounded-full" style={{
                                            backgroundColor: selected ? calculateContrast(color) : color
                                        }}></div>
                                        {title}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {filteredEpisodes.map((episode: any, index: number) => (
                        <Episode episode={episode} key={index} ShowName={ShowName} />
                    ))}
                    
                    {selectedTagIds.length === 0 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
                </div>
            </div>
        </div>
    )
}