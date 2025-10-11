"use client";
import Link from "next/link";
import { MarqueeLinkType } from ".";
import { useEffect, useState } from "react";
function Separator() {
    return <span className="text-gray-500 mx-1 h-8 w-8"><img src="/images/03_TLIS_logo2020_white_no-bkg.svg" alt="Separator" className="w-8 h-8" /></span>;
}

export default function Marquee({ data }: { data?: MarqueeLinkType[] }) {
    // Calculate animation duration based on screen width
    const baseDuration = 20; // seconds
    const [duration, setDuration] = useState(baseDuration);
    const [repeatedData, setRepeatedData] = useState<MarqueeLinkType[]>(data ?? []);

    useEffect(() => {
        function updateValues() {
            const width = typeof window !== "undefined" ? window.innerWidth : 1200;
            const newDuration = Math.max(baseDuration, width / 100);
            const repeatCount = Math.ceil(width / 300);
            setDuration(newDuration);
            setRepeatedData(Array(repeatCount).fill(data).flat());
        }
        updateValues();
        window.addEventListener("resize", updateValues);
        return () => window.removeEventListener("resize", updateValues);
    }, [data]);

    // We'll measure the rendered width of one set of items and animate by that width
    const [trackWidth, setTrackWidth] = useState<number | null>(null);

    useEffect(() => {
        const trackWrap = document.querySelector('#marquee-track') as HTMLDivElement | null;
        if (!trackWrap) return;

        const observed = trackWrap;

        function update() {
            const child = observed.querySelector('.marquee-content') as HTMLDivElement | null;
            if (!child) return;
            const width = child.getBoundingClientRect().width;
            setTrackWidth(width);
        }

        update();
        const ro = new ResizeObserver(update);
        ro.observe(observed);
        window.addEventListener('resize', update);
        return () => { ro.disconnect(); window.removeEventListener('resize', update); };
    }, [repeatedData]);

    // Speed in pixels per second
    const speed = 80; // adjust for desired speed
    const computedDuration = trackWidth ? Math.max(8, trackWidth / speed) : duration;

    return (
        <div id="marquee-container" className="bg-black w-full overflow-hidden">
            <style>
                {`
                    /* keyframes animate by the measured width using CSS variable */
                    @keyframes marquee-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(calc(var(--marquee-distance) * -1)); }
                    }
                    .marquee-viewport { white-space: nowrap; }
                    .marquee-track-wrap { display: inline-flex; align-items: center; will-change: transform; animation: marquee-scroll ${computedDuration}s linear infinite; }
                    .marquee-content { display: inline-flex; align-items: center; white-space: nowrap; }
                    .marquee-track-wrap:hover { animation-play-state: paused; }
                    @media (prefers-reduced-motion: reduce) {
                        .marquee-track-wrap { animation: none; }
                    }
                `}
            </style>

            <div className="py-1 marquee-viewport">
                <div id="marquee-track" className="marquee-track-wrap" style={{ ['--marquee-distance' as any]: `${trackWidth ?? 0}px` }}>
                    <div className="marquee-content">
                        {repeatedData.map((item, index) => (
                            <span key={index} className="inline-flex items-center">
                                <Link href={item.url} target={item.target} className="text-white text-xl mx-4 hover:underline uppercase font-bold">
                                    {item.text}
                                </Link>
                                 <Separator />
                            </span>
                        ))}
                    </div>
                    <div className="marquee-content" aria-hidden="true">
                        {repeatedData.map((item, index) => (
                            <span key={`dup-${index}`} className="inline-flex items-center">
                                <Link href={item.url} target={item.target} className="text-white text-xl mx-4 uppercase font-bold">
                                    {item.text}
                                </Link>
                                <Separator />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}