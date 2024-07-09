import { faPause, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import VolumeControl from './volume-control';

/**
 ** https://youtu.be/Of_8YG8b760?si=59_oOEfijIUgVrGx
 * "I did, and still got nothing, but it works :)." - Jizzus 8:23 3.7.2024
 * 
 * TODO: We need to style the volume slider. I tried, didn't work ̸/̸̅̅ ̆̅ ̅̅ ̅̅  ( ╥ᆺ╥ ) . - Jizzus 11:37 5.7.2023
 */

type PlayerControlProps = {
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    audioSource: string;
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
};

const PlayerControl: React.FC<PlayerControlProps> = ({
    isPlaying,
    setIsLoading,
    isLoading,
    setIsPlaying,
    audioSource,
    audioRef,
}) => {
    const [volume, setVolume] = useState(1); // Changed default volume to 100% because of mobile devices

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(audioSource);
            audioRef.current.volume = volume;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";  // Stop downloading the stream
            }
        };
    }, [audioSource]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handlePlayPause = () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";  // Stop downloading the stream
            }
            setIsPlaying(false);
        } else {
            if (audioRef.current) {
                audioRef.current.src = audioSource;  // Set the source again to resume playback
                setIsLoading(true);
                audioRef.current.play().then(() => {
                    setIsLoading(false);
                    setIsPlaying(true);
                }).catch((err) => {
                    console.warn(err);
                });
            }
        }
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(Number(event.target.value));
    };

    return (
        <div className="flex items-center gap-1">
            <span
                role="button"
                tabIndex={0}
                className="flex cursor-pointer text-2xl p-2.5 rounded-full bg-[#d43c4a]"
                onClick={handlePlayPause}
            >
                {isLoading && <FontAwesomeIcon className="animate-spin" icon={faSpinner} />}
                {!isPlaying && !isLoading && <FontAwesomeIcon className="px-[3px]" icon={faPlay} />}
                {isPlaying && <FontAwesomeIcon className="px-[4.5px]" icon={faPause} />}
            </span>

            {
            // TODO - Style the volume slider
            // TODO - This is a hotfix, it's still desired to know if we're working with a mobile or tablet device so we can use different initial volume states for PCs and phones/tablets, hence try to find a way to find device type while also keeping SSR - Jager 13:11 9.7.2024
            }

            <div className='hidden sm:block'>
                <VolumeControl volume={volume} handleVolumeChange={handleVolumeChange} />
            </div>
        </div>
    );
};

export default PlayerControl;
