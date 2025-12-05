"use client"

import { useEmbeddedPlayer } from "./EmbeddedPlayerContext";
import TlisImage from "@/components/TlisImage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faShareAlt as faShare } from '@fortawesome/free-solid-svg-icons';
import classNames from "classnames";

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

export default function EmbeddedEpisodeView({ episode }: { episode: any }) {
    const { setMode, setArchiveName, setSrc, setArchiveEpisodeId, setArchiveMetadata, setArchiveShowName, setArchiveEpisodeCover, isPlaying, setIsPlaying } = useEmbeddedPlayer();

    function playEpisode(episode: any) {
        setMode("archive");
        setArchiveName(episode.Title);
        setArchiveShowName("Rádio TLIS");
        setArchiveEpisodeCover(episode.Cover);
        setArchiveMetadata({
            author: "Rádio TLIS",
            album: "Rádio TLIS",
            image: episode.Cover
        });
        setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio}`);
        setArchiveEpisodeId(episode.id);
        setIsPlaying(true);
    }

    function togglePlayPause() {
        setIsPlaying(!isPlaying);
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

    const hasAudio = episode.Audio && episode.Audio !== "" && episode.Audio !== null;

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/10">
                <div className="flex flex-col items-center space-y-5">
                    {/* Cover Image */}
                    <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                        <TlisImage
                            src={episode.Cover}
                            width={500}
                            height={500}
                            alt={episode.Title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Tags */}
                    {episode.Tags && episode.Tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {episode.Tags.map((tag: any) => (
                                <span
                                    key={tag.Tags_id.id}
                                    style={{
                                        background: `${tag.Tags_id.Color}`,
                                        color: calculateContrast(tag.Tags_id.Color)
                                    }}
                                    className="text-xs font-medium px-3 py-1.5 rounded-full shadow-md"
                                >
                                    {tag.Tags_id.Title}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Episode Info */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white leading-tight">
                            {episode.Title}
                        </h2>
                        <p className="text-sm text-zinc-400">
                            {new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views} {episode.Views == 1 ? "vypočutie" : "vypočutí"}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    {hasAudio && (
                        <div className="flex items-center justify-center gap-3 w-full pt-2">
                            <button
                                onClick={() => shareEpisode(episode)}
                                aria-label="Share episode"
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-700/80 hover:bg-zinc-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <FontAwesomeIcon icon={faShare} className="text-white" />
                            </button>
                            <button
                                onClick={() => {
                                    if (!isPlaying) {
                                        playEpisode(episode);
                                    } else {
                                        togglePlayPause();
                                    }
                                }}
                                className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#d43c4a] to-[#b83744] hover:from-[#b83744] hover:to-[#9a2e39] transition-all duration-200 shadow-lg hover:shadow-xl"
                                aria-label={isPlaying ? "Pause episode" : "Play episode"}
                            >
                                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={classNames("text-white text-xl", !isPlaying && "ml-1")} />
                            </button>
                        </div>
                    )}

                    {/* Description - if needed */}
                    {episode.Description && (
                        <div className="text-sm text-zinc-300 text-center leading-relaxed max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent px-2">
                            {episode.Description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
