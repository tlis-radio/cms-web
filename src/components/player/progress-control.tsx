import React from 'react';

interface ProgressControlProps {
    currentTime: number;
    duration: number;
    handleProgressChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function getTimeFromMs(ms: number): string {
    const hours = Math.floor(ms / 3600);
    const minutes = Math.floor((ms % 3600) / 60);
    const seconds = Math.floor(ms % 60);
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const ProgressControl: React.FC<ProgressControlProps> = ({ currentTime, duration, handleProgressChange }) => {
    return (
        <div className='flex items-center gap-4 px-4'>
            <p className='text-white w-24'>{getTimeFromMs(currentTime)}</p>
            <div className='px-2.5 py-1 rounded-full bg-[#d43c4a] w-full'>
                <input
                    className='w-[100%] cursor-pointer'
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={currentTime}
                    onChange={handleProgressChange}
                />
            </div>
            <p className='text-white'>{getTimeFromMs(duration)}</p>
        </div>
    );
};

export default ProgressControl;