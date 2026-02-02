"use client";
import React from "react";
import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faShareAlt as faShare } from "@fortawesome/free-solid-svg-icons";
import TlisImage from "@/components/TlisImage";
import Link from "next/link";
import { Episode } from "@/models/episode";

function calculateContrast(hexColor: string): string {
    if (!hexColor) return '#000000';
    const color = hexColor.replace('#', '');
    if (color.length !== 6) return '#000000';
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

interface EpisodeEmbedProps {
   episode: Episode;
   showName?: string;
   showSlug?: string;
}

export default function EpisodeEmbed({ episode, showName = "Radio TLIS", showSlug }: EpisodeEmbedProps) {
   const { 
      setMode, 
      setArchiveName, 
      setSrc, 
      setArchiveEpisodeId, 
      setArchiveMetadata, 
      setArchiveShowName, 
      setArchiveEpisodeCover
   } = usePlayer();

   function selectEpisode() {
      setMode("archive");
      setArchiveName(episode.Title);
      setArchiveShowName(showName);
      setArchiveEpisodeCover(episode.Cover);
      setArchiveMetadata({
         author: showName,
         album: showName,
         image: episode.Cover
      });
      setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio?.id || episode.Audio}`);
      setArchiveEpisodeId(Number(episode.id));
   }

   function shareEpisode() {
      const url = showSlug 
         ? `${window.location.origin}/relacie/${showSlug}?sharedEpisode=${episode.id}`
         : window.location.href;
      
      if (navigator.share) {
         navigator.share({
            title: episode.Title,
            url: url,
         }).catch(() => { });
      } else {
         navigator.clipboard.writeText(url);
      }
   }

   if (!episode) return null;

   return (
      <div className="border bg-[#1c1c1c] p-4 text-white drop-shadow-lg my-6">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-48 w-full flex-shrink-0">
               <TlisImage
                  preview
                  src={episode.Cover}
                  width={500}
                  height={500}
                  alt={episode.Title}
                  className="w-full h-auto sm:flex-shrink-0 object-contain"
               />
            </div>

            <div className="flex-1 flex flex-col">
               <div className="flex justify-between items-start gap-4 md:flex-row flex-col mt-0 md:mt-2">
                  <div className="flex flex-col items-start">
                     {episode.Tags && episode.Tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                           {episode.Tags.map((tag: any) => (
                              <span
                                 key={tag.Tags_id.id}
                                 style={{
                                    background: `${tag.Tags_id.Color}`,
                                    color: calculateContrast(tag.Tags_id.Color)
                                 }}
                                 className="text-xs font-medium px-2 py-1 rounded"
                              >
                                 {tag.Tags_id.Title}
                              </span>
                           ))}
                        </div>
                     )}
                     <h2 className="text-2xl font-semibold flex-1 text-left">{episode.Title}</h2>
                     <p className="text-gray-300">
                        {new Date(episode.Date).toLocaleDateString("sk-SK")} • {episode.Views} {episode.Views === 1 ? "vypočutie" : "vypočutí"}
                        {showSlug && (
                           <>
                              {" • "}
                              <Link 
                                 href={`/relacie/${showSlug}`}
                                 className="text-[#d43c4a] hover:text-[#f05561] transition-colors underline decoration-dotted"
                              >
                                 {showName}
                              </Link>
                           </>
                        )}
                     </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                     <button
                        onClick={shareEpisode}
                        aria-label="Share episode"
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                     >
                        <FontAwesomeIcon icon={faShare} />
                     </button>
                     {episode.Audio && (episode.Audio.id || episode.Audio) && (
                        <button
                           onClick={selectEpisode}
                           className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] transition-colors"
                           aria-label="Play episode"
                        >
                           <FontAwesomeIcon icon={faPlay} className="ml-1" />
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
