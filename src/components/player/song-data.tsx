import React from "react";
import { Root } from "@/types/streamstatus";
import { useEffect, useState } from "react";
import ProgressControl from "./progress-control";
import Marquee from "./marquee";

async function fetchSourceTitle(apiEndpoint: string): Promise<string[]> {
   const response = await fetch(apiEndpoint);
   const data: Root = await response.json();
   const source = data.icestats.source;
   let title = "";

   if (Array.isArray(source)) {
      // Define the title of the first source in the array
      if (source[1].listenurl === "http://stream.tlis.sk:8000/studio.mp3") {
         title = String(source[1]?.title || "Nič na počúvanie");
      } else {
         title = String(source[0]?.title || "Nič na počúvanie");
      }
   } else {
      // If source is a single object
      title = String(source?.title || "Nič na počúvanie");
   }

   /**
    * TODO: this doesn't work for some reason, might be a whitespace issue - Jäger 17.7.2024
    * *Status update - It works. IDK what he is talking about, i haven't changed the if statement - Jizzus 19.7.2024
    * !Status update - Saw a bug triggerd by a song, need to find out the metadata of that song - Jizzus 28.7.2024
    * *Status update - I added String(...) to the title because the bug was maybe type related - Jizzus 28.7.2024
    * *Status update - I modified the inside of the String(...), in case the source would be, for some fkin reason, null - Jizzus 9.8.2024
    */

   if (title === "Unknown") {
      return ["Počúvate Rádio TLIS"];
   }
   // Reverse used to switch artist and song title
   return title.split(" - ").reverse();
}

function PlayerDisplay({ mode, archiveName, currentTime, duration, updateCurrentTime }: { mode: "stream" | "archive", archiveName: string | null, currentTime: number, duration: number, updateCurrentTime: (currentTime: number) => void }) {
   const [titleParts, setTitleParts] = useState<string[]>([]);

   useEffect(() => {
      const fetchTitle = async () => {
         if (mode === "archive") return;

         // TODO put the stream URL into environment variables (process.env and NEXT_PUBLIC_)

         const apiEndpoint = "https://stream.tlis.sk/status-json.xsl";
         const titleParts = await fetchSourceTitle(apiEndpoint);
         setTitleParts(titleParts);
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
               <Marquee className="px-2 font-argentumSansLight text-sm sm:text-base" data-tip={archiveName} text={archiveName || ''} />
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
                  className="px-2 font-argentumSansLight text-sm sm:text-base truncate"
                  data-tip={titleParts.join(" ")}
               />
            </div>
         )}
      </div>
   );
};

export default PlayerDisplay;