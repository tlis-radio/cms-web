"use client";
import React, { useRef, useState, useEffect } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isVisible: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek, isVisible }) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tempProgress, setTempProgress] = useState<number | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const displayProgress = tempProgress !== null ? tempProgress : progress;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateProgress(e.clientX);
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateProgress(e.clientX);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      updateProgress(e.clientX, true);
      setIsDragging(false);
      setTempProgress(null);
      // Restore text selection
      document.body.style.userSelect = '';
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateProgress(e.touches[0].clientX);
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      updateProgress(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging) {
      if (e.changedTouches.length > 0) {
        updateProgress(e.changedTouches[0].clientX, true);
      }
      setIsDragging(false);
      setTempProgress(null);
      // Restore text selection
      document.body.style.userSelect = '';
    }
  };

  const updateProgress = (clientX: number, commit: boolean = false) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;

    if (commit) {
      onSeek(newTime);
    } else {
      setTempProgress(percentage);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={progressBarRef}
      className="absolute top-0 left-0 w-full h-1 bg-[#1c1c1c] cursor-pointer select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Progress bar fill */}
      <div
        className="h-full bg-[#d43c4a] pointer-events-none"
        style={{ width: `${displayProgress}%` }}
      />
      
      {/* Draggable circle indicator - hidden on mobile when player is hidden */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-150 ${isVisible ? 'block' : 'hidden'}`}
        style={{
          left: `${displayProgress}%`,
          transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.3)' : 'scale(1)'}`,
        }}
      />
    </div>
  );
};

export default ProgressBar;
