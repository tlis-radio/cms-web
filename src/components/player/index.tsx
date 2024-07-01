'use client';

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
            <audio src={audioSource} />
            {isPlaying ? (
                <button onClick={handlePlayPause}>
                    <div className="flex gap-2">
                        <div className="w-4 h-10 bg-black"></div>
                        <div className="w-4 h-10 bg-black"></div>
                    </div>
                </button>
            ) : (
                <button onClick={handlePlayPause}>
                    <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[35px] border-l-black"></div>
                </button>
            )}
        </>
    );
};

export default AudioPlayer;