import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons';

interface VolumeControlProps {
    volume: number;
    handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, handleVolumeChange }) => {
    return (
        // group to allow showing the slider on hover/focus-within
        <div className="group relative inline-flex items-center">
            {/* Icon button */}
            <button
                aria-label="Volume"
                className="flex items-center justify-center w-10 h-10 cursor-pointer text-lg rounded-full bg-[#d43c4a] text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
                <FontAwesomeIcon icon={faVolumeHigh} />
            </button>

            {/* Slider — hidden by default, shown on hover/focus-within. Positioned to the right of the icon. */}
            <div className="absolute z-50 left-full pl-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity duration-150">
                <div className="px-3 py-2 rounded-full bg-[#d43c4a]">
                    <input
                        aria-label="Volume slider"
                        className="w-[150px] cursor-pointer"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default VolumeControl;