"use client"

import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import Markdown from 'react-markdown'
import TlisImage from "@/components/TlisImage";

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
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col items-start">
                        <h2 className="text-2xl font-semibold flex-1 text-left">{episode.Title}</h2>
                        <p>{new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views} {episode.Views == 1 ? "vypočutie" : "vypočutí"}</p>
                    </div>
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

export default function Shows({ show, moderators, episodes, ShowName }: { show: any, moderators: Array<string>, episodes: any, ShowName: string }) {
    return (
        <div className="mb-[80px] flex w-full justify-center md:mb-0">
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
                                <p>{moderators.join(", ")}</p>
                                <p>Archív: {episodes.length}</p>
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
                    {episodes.map((episode: any, index: number) => (
                        <Episode episode={episode} key={index} ShowName={ShowName} />
                    ))}
                </div>
            </div>
        </div>
    )

}