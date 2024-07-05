'use client';

import { faPause, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';

/**
 ** https://youtu.be/Of_8YG8b760?si=59_oOEfijIUgVrGx
 * "I did, and still got nothig, but it works :)." - Jizzus 8:23 3.7.2024
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
    const [volume, setVolume] = useState<number>(1); // Initial volume set to 1 (max volume)

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
        <div className="flex flex-col items-center gap-1">
            <span
                role="button"
                tabIndex={0}
                className="cursor-pointer text-4xl"
                onClick={handlePlayPause}
            >
                {isLoading && <FontAwesomeIcon className="animate-spin" icon={faSpinner} />}
                {!isPlaying && !isLoading && <FontAwesomeIcon icon={faPlay} />}
                {isPlaying && <FontAwesomeIcon icon={faPause} />}
            </span>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
            />
        </div>
    );
};

export default PlayerControl;
