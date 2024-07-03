'use client';

import { faPause, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useRef, useEffect } from 'react';

/**
 ** https://youtu.be/Of_8YG8b760?si=59_oOEfijIUgVrGx
 * "I did, and still got nothig, but it works :)." - Jizzus 8:23 3.7.2024
 */

const AudioPlayer: React.FC = () => {
    const audioSource = "https://stream.tlis.sk/tlis.mp3";
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(audioSource);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";  // Stop downloading the stream
            }
        };
    }, [audioSource]);

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

    return (
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
    );
};

export default AudioPlayer;
