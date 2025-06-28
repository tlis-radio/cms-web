'use client';
import { useEffect, useState } from "react";
import { useVynilPlayer } from "./VynilProvider";
import React from "react";

export default function Waveform() {

    const { isPlaying, analyser, sourceNode, audioContext, audioBuffer, songDuration, currentPosition, seekVynil } = useVynilPlayer();
    
    const [barRate, setBarRate] = useState(200);
    const [waveformData, setWaveformData] = useState<number[]>([]);
    const isWaveformDragging = React.useRef(false);

    function analyzeAudio(buffer: AudioBuffer) {
        const channelData = buffer.getChannelData(0);
        const samplesPerPixel = Math.floor(buffer.length / barRate);

        var waveform: number[] = [];

        for (let i = 0; i < barRate; i++) {
            const start = Math.floor(i * samplesPerPixel);
            const end = Math.floor((i + 1) * samplesPerPixel);
            let sum = 0;

            for (let j = start; j < end; j++) {
                sum += Math.abs(channelData[j]);
            }

            const avg = sum / (end - start);
            waveform.push(avg);
        }
        setWaveformData(waveform);
    }

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function createWaveform() {
        const waveform = document.getElementById('waveform');

        if (!waveform) return;

        waveform.innerHTML = '';

        const maxValue = Math.max(...waveformData);

        waveformData.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'wave-bar';

            const heightPercent = (value / maxValue) * 100;
            bar.style.height = `${heightPercent}%`;
            bar.dataset.index = index.toString();
            waveform.appendChild(bar);
        });
    }


    function seekToPosition(event: MouseEvent | TouchEvent) {
        const waveformContainer = document.getElementById('waveform');
        if (!audioBuffer || !waveformContainer) return;

        const rect = waveformContainer.getBoundingClientRect();
        let clickX: number;
        if ('clientX' in event) {
            clickX = event.clientX - rect.left;
        } else if ('touches' in event && event.touches.length > 0) {
            clickX = event.touches[0].clientX - rect.left;
        } else {
            return;
        }
        const percent = Math.min(1, Math.max(0, clickX / rect.width));
        seekVynil(percent * songDuration);
    }

    function updateWaveformProgress() {
        var progress = currentPosition / songDuration;
        const bars = document.querySelectorAll('.wave-bar');
        const activeIndex = Math.floor(progress * bars.length);

        bars.forEach((bar, index) => {
            if (index <= activeIndex) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });
    }

    useEffect(() => {
        const waveformContainer = document.getElementById('waveform');
        if (!waveformContainer) return;
        function handleWaveformClick(e: MouseEvent) {
            seekToPosition(e);
        }

        function handleWaveformMouseDown(e: MouseEvent) {
            isWaveformDragging.current = true;
            seekToPosition(e);
        }

        function handleDocumentMouseMove(e: MouseEvent) {
            if (isWaveformDragging.current) {
                seekToPosition(e);
            }
        }

        function handleDocumentMouseUp() {
            isWaveformDragging.current = false;
        }

        function handleWaveformTouchStart(e: TouchEvent) {
            isWaveformDragging.current = true;
            seekToPosition(e);
        }

        function handleDocumentTouchMove(e: TouchEvent) {
            if (isWaveformDragging.current) {
                seekToPosition(e);
            }
        }

        function handleDocumentTouchEnd() {
            isWaveformDragging.current = false;
        }

        waveformContainer.addEventListener('click', handleWaveformClick);
        waveformContainer.addEventListener('mousedown', handleWaveformMouseDown);
        document.addEventListener('mousemove', handleDocumentMouseMove);
        document.addEventListener('mouseup', handleDocumentMouseUp);
        waveformContainer.addEventListener('touchstart', handleWaveformTouchStart);
        document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
        document.addEventListener('touchend', handleDocumentTouchEnd);

        return () => {
            waveformContainer.removeEventListener('click', handleWaveformClick);
            waveformContainer.removeEventListener('mousedown', handleWaveformMouseDown);
            document.removeEventListener('mousemove', handleDocumentMouseMove);
            document.removeEventListener('mouseup', handleDocumentMouseUp);
            waveformContainer.removeEventListener('touchstart', handleWaveformTouchStart);
            document.removeEventListener('touchmove', handleDocumentTouchMove);
            document.removeEventListener('touchend', handleDocumentTouchEnd);
        };
    }, [isPlaying, audioBuffer, currentPosition, songDuration, sourceNode, audioContext, analyser]);

    useEffect(()=>{
        function handleResize() {
            const container = document.getElementById('waveform-container');
            if (container) {
                const width = container.offsetWidth;
                const calculatedBarRate = Math.max(50, Math.min(200, Math.floor(width / 4.5)));
                setBarRate(calculatedBarRate);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    },[])
    
    useEffect(() => {
        createWaveform();
    }, [waveformData])
    useEffect(() => { updateWaveformProgress(); }, [currentPosition, songDuration]);
    useEffect(() => { if (audioBuffer) analyzeAudio(audioBuffer); }, [audioBuffer, barRate]);

    return <div id="waveform-container">
        <div id="waveform"></div>
        <div
            id="time-display"
            className="absolute left-0 bottom-[-32px] text-white text-2xl pointer-events-none"
        >
            {formatTime(currentPosition)}
        </div>
        <div
            id="duration-display"
            className="absolute right-0 bottom-[-32px] text-white text-2xl pointer-events-none"
        >
            {formatTime(songDuration)}
        </div>
    </div>
}