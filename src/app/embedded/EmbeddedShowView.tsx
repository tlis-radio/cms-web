"use client"

import TlisImage from "@/components/TlisImage";
import Markdown from 'react-markdown'
import { ShowCast } from "@/types/show";

export default function EmbeddedShowView({ show, totalCount }: { show: any, totalCount: number }) {
    return (
        <div className="w-full h-full p-6 bg-gradient-to-br from-zinc-900/95 via-zinc-800/95 to-zinc-900/95 backdrop-blur-sm rounded-2xl shadow-2xl">
            <div className="flex flex-col gap-6 md:flex-row items-center md:items-start">
                <div className="w-40 md:w-48 aspect-square flex-shrink-0 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/10">
                    <TlisImage
                        src={show.Cover}
                        width={500}
                        height={500}
                        alt={show.Title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
                    <h1 className="font-argentumSansBold text-4xl md:text-5xl text-white leading-tight">
                        {show.Title}
                    </h1>
                    <div className="flex flex-col gap-2 text-zinc-300 font-argentumSansLight">
                        <p className="flex flex-wrap gap-1 items-center justify-center md:justify-start">
                            <span className="text-zinc-400">Redaktori:</span>
                            <span className="font-medium text-white">
                                {show.Cast.map((castMember: ShowCast, index: number) => (
                                    <span key={index}>
                                        {castMember.Cast_id.Name}
                                        {index < show.Cast.length - 1 ? ' / ' : ''}
                                    </span>
                                ))}
                            </span>
                        </p>
                        <p className="flex items-center gap-1 justify-center md:justify-start">
                            <span className="text-zinc-400">Počet epizód:</span>
                            <span className="font-medium text-white">{totalCount}</span>
                        </p>
                    </div>
                    <div className="font-argentumSansLight text-zinc-300 text-sm md:text-base leading-relaxed max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent">
                        <Markdown>
                            {show.Description}
                        </Markdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
