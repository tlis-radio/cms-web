"use client";
import { GetEpisodeById } from "@/app/actions";
import TlisImage from "@/components/TlisImage";
import { usePlayer } from "@/context/PlayerContext";
import { Episode } from "@/models/episode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ShareShow() {
    const { setMode, setArchiveName, setSrc, setArchiveEpisodeId, setArchiveMetadata } = usePlayer();

    const searchParams = useSearchParams();
    const [sharedEpisode, setSharedEpisode] = useState<Episode | null>(null);

    useEffect(() => {
        if (!searchParams) return;
        const episodeId = searchParams.get("sharedEpisode");
        if (!episodeId) return;

        GetEpisodeById(parseInt(episodeId)).then((episode) => {
            setSharedEpisode(episode);
        });
        fetch(`/api/share/${episodeId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }).catch((err) => {
            console.error("Failed to count view:", err);
        });
    }, []);

    function playEpisode(episode: any) {
        setMode("archive");
        setArchiveName(episode.Title);
        setArchiveMetadata({
            author: "Rádio TLIS",
            album: "Rádio TLIS",
            image: episode.Cover
        });
        setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio}`);
        setArchiveEpisodeId(episode.id);
        setSharedEpisode(null);
    }

    if (sharedEpisode) {
        return (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={(e) => {
                    if (e.target === e.currentTarget) setSharedEpisode(null);
                }}
            >
                <div className="shadow-lg p-6 sm:p-8 w-full max-w-xs sm:max-w-md bg-[#1c1c1c] text-white rounded-lg flex flex-col items-center">
                    <div className="relative w-full flex flex-col items-center">
                        <TlisImage
                            preview
                            src={sharedEpisode.Cover}
                            width={500}
                            height={500}
                            alt={sharedEpisode.Title}
                            className="w-full h-auto object-contain rounded"
                        />
                        <button
                            onClick={() => setSharedEpisode(null)}
                            className="absolute top-2 right-2 text-white bg-black bg-opacity-60 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-80 transition"
                            aria-label="Close"
                            type="button"
                        >
                            <span className="text-lg font-bold">&times;</span>
                        </button>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold mt-4 mb-2 text-center">{sharedEpisode.Title}</h2>
                    <p className="mb-4 text-center text-sm sm:text-base">
                        {new Date(sharedEpisode.Date).toLocaleDateString("sk-SK")} • {sharedEpisode.Views} {sharedEpisode.Views == 1 ? "vypočutie" : "vypočutí"}
                    </p>
                    {sharedEpisode.Audio && sharedEpisode.Audio !== "" && sharedEpisode.Audio !== null && (
                        <div className="flex items-center justify-center gap-2 w-full">
                            <button
                                onClick={() => playEpisode(sharedEpisode)}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-colors"
                                aria-label="Play episode"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faPlay} className="ml-1" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );

    }
    return <></>
}