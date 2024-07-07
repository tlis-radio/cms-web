import React from 'react';

interface VolumeControlProps {
    volume: number;
    handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, handleVolumeChange }) => {
    return (
        <div className='px-2.5 py-1 rounded-full bg-[#d43c4a]'>
            <input
                className='w-[100%] cursor-pointer'
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

export default VolumeControl;