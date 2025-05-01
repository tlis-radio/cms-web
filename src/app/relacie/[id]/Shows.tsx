"use client"

import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from '@fortawesome/free-solid-svg-icons';

export default function Shows({ show, moderators, episodes }: { show: any, moderators: Array<string>, episodes: any }) {
    const {setMode, setArchiveName, setSrc } = usePlayer();

    function selectEpisode(episodeSrc: string, episodeName: string, episodeCover: string, episodeDescription: string) {
        setMode("archive");
        setArchiveName(episodeName);
        setSrc(episodeSrc);
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
                    {episodes.map((episode: any, index: number) => {
                        return (
                            <div key={index} className="flex flex-col gap-4 border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
                                <div className="flex flex-col gap-6 md:flex-row ">
                                    <img className="md:h-52" src={"https://directus.tlis.sk/assets/" + episode.Cover} />
                                    <div className="flex py-2.5 h-max w-full flex-col gap-4">
                                        <p className="text-2xl text-left font-semibold">{episode.Title}</p>
                                    </div>
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        className="w-fit h-fit flex cursor-pointer text-2xl p-2.5 rounded-full bg-[#d43c4a]"
                                        onClick={() => {
                                            selectEpisode("https://directus.tlis.sk/assets/" + episode.Audio, episode.Title, episode.Cover, episode.Description);
                                        }}
                                    >
                                    <FontAwesomeIcon className="px-[3px]" icon={faPlay} />
                                    </span>
                                </div>
                                <div className="flex h-full gap-4 md:flex-col">
                                    <p>{episode.Description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

}