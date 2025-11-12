import React from "react";
import { useEffect, useState } from "react";
import ProgressControl from "./progress-control";
import Marquee from "./marquee";
import Link from "next/link";

function PlayerDisplay({ mode, archiveName, archiveShowSlug, currentTime, duration, updateCurrentTime }: { mode: "stream" | "archive", archiveName: string | null, archiveShowSlug: string | null, currentTime: number, duration: number, updateCurrentTime: (currentTime: number) => void }) {
   const [titleParts, setTitleParts] = useState<string[]>([]);

   useEffect(() => {
      const fetchTitle = async () => {
         if (mode === "archive") return;

         const currentStreamTitleResponse = await fetch('/api/stream');
         const currentStreamTitle = await currentStreamTitleResponse.text();
         if (currentStreamTitle) return setTitleParts([currentStreamTitle]);
         else setTitleParts(["Neznáme rádio"]);
         document.dispatchEvent(new CustomEvent("stream-title-updated", { detail: titleParts.join(" ") }));
      };

      // Call fetchTitle immediately when the component mounts
      fetchTitle();

      // Set up an interval to call it every 5 seconds
      const intervalId = setInterval(fetchTitle, 5000);

      // Clear the interval when the component unmounts
      return () => clearInterval(intervalId);
   }, []); // Empty dependency array means this effect runs once on mount

   return (
      <div className="w-full overflow-hidden">
         {mode === "archive" ? (
            <div className="w-full">
               <Link href={`/relacie/${archiveShowSlug}`}>
                  <Marquee className="font-argentumSansLight text-sm sm:text-base" data-tip={archiveName} text={archiveName || ''} />
               </Link>
               <ProgressControl
                  currentTime={currentTime}
                  duration={duration}
                  handleProgressChange={(e) => {
                     updateCurrentTime(Number(e.target.value));
                  }}
               />
            </div>
         ) : (
            <div className="flex flex-col">
               <Marquee
                  text={titleParts.join(" ")}
                  speed={15}
                  className="font-argentumSansLight text-sm sm:text-base truncate"
                  data-tip={titleParts.join(" ")}
               />
            </div>
         )}
      </div>
   );
};

export default PlayerDisplay;