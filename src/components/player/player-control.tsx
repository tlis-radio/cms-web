import { faPause, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import VolumeControl from './volume-control';
import { usePlayer } from '@/context/PlayerContext';

/**
 ** https://youtu.be/Of_8YG8b760?si=59_oOEfijIUgVrGx
 * "I did, and still got nothing, but it works :)." - Jizzus 8:23 3.7.2024
 * 
 * TODO: We need to style the volume slider. I tried, didn't work ̸/̸̅̅ ̆̅ ̅̅ ̅̅  ( ╥ᆺ╥ ) . - Jizzus 11:37 5.7.2023
 */

type PlayerControlProps = {};

const PlayerControl: React.FC<PlayerControlProps> = () => {
    const { audioRef, isLoading, isPlaying, setIsPlaying } = usePlayer();
    const [volume, setVolume] = useState(1); // Changed default volume to 100% because of mobile devices

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(event.target.value));
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <button
                className="flex items-center justify-center w-10 h-10 cursor-pointer text-xl rounded-full bg-[#d43c4a] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isLoading && <FontAwesomeIcon className="animate-spin" icon={faSpinner} />}
                {!isPlaying && !isLoading && <FontAwesomeIcon icon={faPlay} />}
                {isPlaying && <FontAwesomeIcon icon={faPause} />}
            </button>

            <div className='hidden lg:block w-[100px] xxxl:w-[150px]'>
                <VolumeControl volume={volume} handleVolumeChange={handleVolumeChange} />
            </div>
        </div>
    );
};

export default PlayerControl;
