"use client";
import Link from "next/link";
import { MarqueeLinkType } from ".";
import { useEffect, useState } from "react";
function Separator() {
    return <span className="text-gray-500 mx-1"><img src="/images/03_TLIS_logo2020_white_no-bkg.svg" alt="Separator" className="w-8 h-8" /></span>;
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

    return (
        <div className="bg-black w-full overflow-hidden whitespace-nowrap">
            <style>
                {`
                    @keyframes marquee-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-33.333%); }
                    }
                    .marquee-track {
                        display: inline-block;
                        white-space: nowrap;
                        animation: marquee-scroll ${duration}s linear infinite;
                    }
                    .marquee-track:hover { animation-play-state: paused; }
                `}
            </style>
            <div className="py-1">
                <div className="marquee-track">
                    {repeatedData.map((item, index) => (
                        <span key={index} className="inline-flex items-center">
                            <Link href={item.url} target={item.target} className="text-white text-xl mx-4 hover:underline uppercase font-bold">
                                {item.text}
                            </Link>
                            {index < repeatedData.length - 1 && <Separator />}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}