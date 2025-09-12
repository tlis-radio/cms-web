"use client"

import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faShareAlt as faShare, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Markdown from 'react-markdown'
import TlisImage from "@/components/TlisImage";
import { loadMoreEpisodes } from "@/app/actions";
import Link from "next/link";
import { ShowCast } from "@/types/show";

function Episode({ episode, ShowName }: { episode: any, ShowName: string }) {
    const { setMode, setArchiveName, setSrc, setArchiveEpisodeId, setArchiveMetadata } = usePlayer();

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
        setArchiveMetadata({
            author: ShowName,
            album: ShowName,
            image: episode.Cover
        });
        setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio}`);
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
                        {episode.Audio && episode.Audio !== "" && episode.Audio !== null && (
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
                        className={`mt-4 ${isDescriptionExpanded ? "max-h-none" : "max-h-32"} overflow-hidden text-justify tlis-markdown`}
                    >
                        <Markdown>
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
                                className={"mt-2 hover:underline absolute bottom-0 -translate-x-1/2 text-[#D43C4A]"}
                            >
                                {isDescriptionExpanded ? "Skryť" : "Zobraziť viac"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>

}

export default function Shows({ show, episodes, ShowName, totalCount }: { show: any, episodes: any, ShowName: string, totalCount: number }) {
    const [episodesList, setEpisodesList] = useState(episodes);
    const [hasMoreEpisodes, setHasMoreEpisodes] = useState(totalCount > episodes.length);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    async function loadEpisodes() {
        if (isLoading) return;
        setIsLoading(true);
        const nextPage = page + 1;
        setPage(nextPage);
        const { episodes: newEpisodes, totalCount: newTotalCount } = await loadMoreEpisodes(show.id, nextPage);
        setEpisodesList((prev: any[]) => [...prev, ...newEpisodes.episodes]);
        setHasMoreEpisodes(newTotalCount > episodesList.length + newEpisodes.episodes.length);
        setIsLoading(false);
    }

    useEffect(() => {
        if (!hasMoreEpisodes) return;
        const loader = loaderRef.current;
        if (!loader) return;
        let ticking = false;
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoading && hasMoreEpisodes && !ticking) {
                    ticking = true;
                    loadEpisodes().finally(() => { ticking = false; });
                }
            },
            { threshold: 1.0 }
        );
        observer.observe(loader);
        return () => {
            observer.disconnect();
        };
    }, [loaderRef, isLoading, hasMoreEpisodes]);

    return (
        <div className="mb-[80px] flex flex-col w-full justify-center md:mb-0">
            <Link href="/relacie" className="w-full text-white text-left px-2 mb-4 flex gap-2 justify-center items-center">
                <FontAwesomeIcon icon={faChevronLeft} className="w-4" /><p> Zobraziť všetky relácie</p>
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
                                <h1 className="text-2xl font-semibold">{show.Title}</h1>
                                <p className="flex flex-wrap gap-4 justify-center w-full">
                                    {show.Cast.map((castMember: ShowCast, index: number) => (
                                        <span key={index}>{castMember.Cast_id.Name}</span>
                                    ))}
                                </p>
                                <p>Archív: {totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-full gap-4 md:flex-col">
                        <Markdown>
                            {show.Description}
                        </Markdown>
                    </div>
                </div>

                <div className="mb-8">
                    {episodesList.map((episode: any, index: number) => (
                        <Episode episode={episode} key={index} ShowName={ShowName} />
                    ))}
                    {hasMoreEpisodes && (
                        <div className="text-center text-white mt-4" ref={loaderRef}>
                            <svg className="mx-auto h-8 w-8 animate-spin text-[#D43C4A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}