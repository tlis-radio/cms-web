'use client';

import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useRef, useEffect } from 'react';

/**
 * The player know plays music realtime but ...
 * ! now he caches the stream even after the pause.
 * * Open Network in the DevTool, and after you refresh the page look for tlis.mp3 
 *   TODO: We need to fix this cacheing problem
 * * I would try to clear the tlis.mp3 cache every 5 seconds.
 * * So it can play realtime without such a high cache problem. (Klobucikov napad)
 */

const AudioPlayer: React.FC = () => {
    const audioSource = "https://stream.tlis.sk/tlis.mp3";
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio(audioSource);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [audioSource]);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            audioRef.current?.play().then(() => {
                setIsPlaying(true);
            }).catch((err) => {
                console.warn(err);
            });
        }
    };

    return (
        <span
            role="button"
            tabIndex={0}
            className="cursor-pointer text-4xl"
            onClick={handlePlayPause}
        >
            {!isPlaying && <FontAwesomeIcon icon={faPlay} />}
            {isPlaying && <FontAwesomeIcon icon={faPause} />}
        </span>
    );
};

export default AudioPlayer;
