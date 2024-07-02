'use client';

import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useRef } from 'react';

const AudioPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioSource = "http://stream.tlis.sk:8000/fallback.mp3";
    const audioRef = useRef(new Audio(audioSource));

    useEffect(() => {
        // Cleanup to pause the audio if the component unmounts
        return () => {
            audioRef.current.pause();
        };
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            // Pause the audio
            audioRef.current.pause();
            // "Destroy" the audio object by setting it to null
            audioRef.current = null;
        } else {
            // Initialize the audio object if it's not already initialized
            if (!audioRef.current) {
                audioRef.current = new Audio(audioSource);
            }
            // Play the audio
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <>
            <span
                role="button"
                tabIndex={0}
                className="cursor-pointer text-4xl"
                onClick={() => handlePlayPause()}
            >
                {isPlaying ? (
                    <FontAwesomeIcon icon={faPause} />
                ) : (
                    <FontAwesomeIcon icon={faPlay} />
                )}
            </span>
        </>
    );
};

export default AudioPlayer;