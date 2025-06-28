'use client';
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useVynilPlayer } from "./VynilProvider";

export default function Controls() {
    const { isPlaying, playAudio, stopAudio } = useVynilPlayer();

    return (
        <div id="controls" className="mt-5 flex justify-center items-center gap-5">
            <div className="w-10 h-10 bg-red-900 flex items-center justify-center rounded-full cursor-pointer" onClick={()=>{
                if (isPlaying) stopAudio();
                else playAudio();
            }}>
                {isPlaying ? <FontAwesomeIcon icon={faPause} color="white" /> :
                    <FontAwesomeIcon icon={faPlay} color="white" />}
            </div>
        </div>
    );
}