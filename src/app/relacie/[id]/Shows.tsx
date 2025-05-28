"use client"

import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from '@fortawesome/free-solid-svg-icons';

export default function Shows({ show, moderators, episodes }: { show: any, moderators: Array<string>, episodes: any }) {
    const { setMode, setArchiveName, setSrc, setArchiveEpisodeId } = usePlayer();

    function selectEpisode(episodeSrc: string, episodeName: string, episodeId: number) {
        setMode("archive");
        setArchiveName(episodeName);
        setSrc(episodeSrc);
        setArchiveEpisodeId(episodeId);
    }

    return (
        <div className="mb-[80px] flex w-full justify-center md:mb-0">
            <div className="w-full z-10 px-2">
                <div className="flex flex-col gap-4 border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
                    <div className="border-b pb-4">
                        <div className="flex flex-col gap-6 md:flex-row">
                            <img className="md:h-52" src={"https://directus.tlis.sk/assets/" + show.Cover} />
                            <div className="m-auto flex h-max w-full flex-col gap-4">
                                <p className="text-2xl font-semibold">{show.Title}</p>
                                <p>{moderators.join(", ")}</p>
                                <p>Archív: {episodes.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex h-full gap-4 md:flex-col">
                        <p>{show.Description}</p>
                    </div>
                </div>

                <div className="mb-8">
                    {episodes.map((episode: any, index: number) => (
                        <div key={index} className="border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
                            <div className="flex flex-col md:flex-row gap-4">
                                <img
                                    className="w-full h-auto max-h-52 object-cover md:w-48 md:flex-shrink-0"
                                    src={"https://directus.tlis.sk/assets/" + episode.Cover}
                                    alt={episode.Title}
                                />

                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-2xl font-semibold flex-1 text-left">{episode.Title}</h3>
                                        {episode.Audio && episode.Audio !== "" && episode.Audio !== null && (
                                            <button
                                                onClick={() => {
                                                    selectEpisode(
                                                        "https://directus.tlis.sk/assets/" + episode.Audio,
                                                        episode.Title,
                                                        episode.id
                                                    );
                                                }}
                                                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-colors"
                                                aria-label="Play episode"
                                            >
                                                <FontAwesomeIcon icon={faPlay} className="ml-1" />
                                            </button>)}
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-justify">{episode.Description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

}