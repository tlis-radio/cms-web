'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface VinylPlayerState {
    sourceNode: AudioBufferSourceNode | null;
    audioContext: AudioContext | null;
    audioBuffer: AudioBuffer | null;
    analyser: AnalyserNode | null;


    isPlaying: boolean;
    startTime: number;
    songDuration: number;
    currentPosition: number;

    playAudio: (position?: number) => void;
    stopAudio: () => void;
    seekVinyl: (position: number) => void;
}

export interface VinylPlayerContextProps extends VinylPlayerState {
    sourceNode: AudioBufferSourceNode | null;
    audioContext: AudioContext | null;
    audioBuffer: AudioBuffer | null;
    analyser: AnalyserNode | null;


    isPlaying: boolean;
    startTime: number;
    songDuration: number;
    currentPosition: number;

    playAudio: (position?: number) => void;
    stopAudio: () => void;
    seekVinyl: (position: number) => void;
}


const VinylPlayerContext = createContext<VinylPlayerContextProps | undefined>(undefined);

export const VinylProvider = ({ children }: { children: ReactNode }) => {

    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [songDuration, setSongDuration] = useState<number>(0);

    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | null>(null);
    const [currentPosition, setCurrentPosition] = useState<number>(0);
    const rafIdRef = React.useRef<number | null>(null);

    function initAudioContext() {
        if (!audioContext) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            if (!context) {
                console.error("AudioContext is not supported in this browser.");
                return;
            }
            setAudioContext(context);
            const analyserNode = context.createAnalyser();
            analyserNode.fftSize = 256;
            setAnalyser(analyserNode);
        }
    }

    function loadAudioFile(path: string) {
        if (!audioContext) {
            console.error("AudioContext is not initialized.");
            return;
        }

        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.arrayBuffer();
            })
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(buffer => {
                setAudioBuffer(buffer);
                setSongDuration(buffer.duration);
            })
            .catch(err => {
                console.error("Error loading audio from path", err);
            });
    }

    function playAudio(position?: number | null) {
        if (!audioBuffer || !audioContext) return;

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (sourceNode) {
            sourceNode.onended = null;
            sourceNode.stop();
            sourceNode.disconnect();
        }

        var source = audioContext.createBufferSource();

        setSourceNode(source);
        source.buffer = audioBuffer;
        if (analyser) {
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        } else {
            source.connect(audioContext.destination);
        }

        if (position != null) {
            setStartTime(audioContext.currentTime - position);
            source.start(0, position);
            setCurrentPosition(position);
        } else {
            setStartTime(audioContext.currentTime - currentPosition);
            source.start(0, currentPosition);
        }

        source.onended = function () {
            stopAudio();
        };

        setIsPlaying(true);
    }

    function stopAudio() {
        if (sourceNode) {
            sourceNode.stop();
            sourceNode.disconnect();
        }
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }

        setIsPlaying(false);
    }

    var lastSeek = performance.now();
    function seekVinyl(position: number) {
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        if (lastSeek && performance.now() - lastSeek < 100) {
            console.warn("Seeking too frequently, ignoring this seek request.");
            return;
        }
        playAudio(position);
    }


    useEffect(() => {
        function updatePosition() {
            if (audioContext && isPlaying) {
                setCurrentPosition(audioContext.currentTime - startTime);
                if (audioContext.currentTime - startTime >= songDuration) {
                    stopAudio();
                    setCurrentPosition(songDuration);
                    return;
                }
                rafIdRef.current = requestAnimationFrame(updatePosition);
            }
        }

        if (isPlaying) {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
            rafIdRef.current = requestAnimationFrame(updatePosition);
        }

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };
    }, [audioContext, isPlaying, startTime, songDuration]);

    useEffect(() => {
        if (!audioContext) return;
        loadAudioFile('/sample.mp3')
    }, [audioContext])

    useEffect(() => {
        initAudioContext();
    }, [])

    return (
        <div className='vinyl-player' >
            <VinylPlayerContext.Provider
                value={{
                    analyser,
                    sourceNode,
                    audioContext,
                    audioBuffer,
                    isPlaying,
                    startTime,
                    songDuration,
                    playAudio,
                    stopAudio,
                    currentPosition,
                    seekVinyl,
                }}
            >
                {children}
            </VinylPlayerContext.Provider>
        </div>
    );
};

export const useVinylPlayer = () => {
    const context = useContext(VinylPlayerContext);
    if (!context) {
        throw new Error('useVinylPlayer must be used within a VinylProvider');
    }
    return context;
};