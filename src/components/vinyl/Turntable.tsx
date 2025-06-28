'use client';
import { useEffect, useState } from "react";
import { useVinylPlayer } from "./VinylProvider";

export default function Turntable() {

    const { isPlaying, currentPosition, songDuration, seekVinyl } = useVinylPlayer();

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastDragAngle, setLastDragAngle] = useState<number>(0);

    var rotationAngle: number = 0;

    function createGrooves() {
        const groovesContainer = document.getElementById('grooves');
        const vinyl = document.getElementById('vinyl');

        if (!groovesContainer || !vinyl) return;

        groovesContainer.innerHTML = '';
        const grooveCount = 20;
        for (let i = 0; i < grooveCount; i++) {
            const groove = document.createElement('div');
            groove.className = 'groove';
            const percent = 30 + (i * 70) / grooveCount; // from 30% to 100%
            groove.style.position = 'absolute';
            groove.style.width = `${percent}%`;
            groove.style.height = `${percent}%`;
            groove.style.top = `${(100 - percent) / 2}%`;
            groove.style.left = `${(100 - percent) / 2}%`;
            vinyl.appendChild(groove);
        }
    }

    function updateTurntable() {
        var vinyl = document.getElementById('vinyl');
        if (!vinyl) return;

        if (isPlaying) rotationAngle = (currentPosition / songDuration) * 360;
        vinyl.style.transform = `rotate(${rotationAngle}deg)`;
    }

    function startDrag(e: MouseEvent | TouchEvent) {
        const vinyl = document.getElementById('vinyl');
        if (!vinyl) return;

        setIsDragging(true);
        const rect = vinyl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let clientX: number, clientY: number;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e && 'clientY' in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }
        setLastDragAngle(Math.atan2(clientY - centerY, clientX - centerX));
    }


    function duringDrag(e: MouseEvent | TouchEvent) {
        const vinyl = document.getElementById('vinyl');
        if (!vinyl || !isDragging) return;

        const rect = vinyl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let clientX: number, clientY: number;
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('clientX' in e && 'clientY' in e) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else {
            return;
        }
        const currentAngle = Math.atan2(clientY - centerY, clientX - centerX);

        let angleChange = currentAngle - lastDragAngle;

        if (angleChange > Math.PI) angleChange -= 2 * Math.PI;
        if (angleChange < -Math.PI) angleChange += 2 * Math.PI;

        const anglePercentage = angleChange / (2 * Math.PI);

        var newPosition = Math.max(0, Math.min(songDuration, currentPosition + anglePercentage * songDuration));
        seekVinyl(newPosition);
        setLastDragAngle(currentAngle)
    }

    function endDrag() {
        setIsDragging(false);
    }

    useEffect(()=>{
        const vinyl = document.getElementById('vinyl');
        if (!vinyl) return;
        vinyl.addEventListener('mousedown', startDrag);
        vinyl.addEventListener('touchstart', startDrag);
        document.addEventListener('mousemove', duringDrag);
        document.addEventListener('touchmove', duringDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
        return () => {
            vinyl.removeEventListener('mousedown', startDrag);
            vinyl.removeEventListener('touchstart', startDrag);
            document.removeEventListener('mousemove', duringDrag);
            document.removeEventListener('touchmove', duringDrag);  
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
        };
    }, [isDragging, lastDragAngle, currentPosition, songDuration]);

    useEffect(() => {
        updateTurntable();
    }, [currentPosition, songDuration]);

    useEffect(() => {
        createGrooves();
    }, []);

    return <div id="turntable">
        <div id="grooves"></div>
        <div id="vinyl">
            <div id="label"></div>
        </div>
    </div>;
}