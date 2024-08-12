import React from "react";
import { Root } from "@/types/streamstatus";
import { useEffect, useState } from "react";

async function fetchSourceTitle(apiEndpoint: string): Promise<string[]> {
   const response = await fetch(apiEndpoint);
   const data: Root = await response.json();
   const source = data.icestats.source;
   let title = "";

   if (Array.isArray(source)) {
      // Define the title of the first source in the array
      title = String(source[0]?.title || "Nič na počúvanie");
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

const PlayerDisplay: React.FC = () => {
   const [titles, setTitles] = useState<string[]>([]);

   useEffect(() => {
      const fetchTitle = async () => {

         // TODO put the stream URL into environment variables (process.env and NEXT_PUBLIC_)

         const apiEndpoint = "https://stream.tlis.sk/status-json.xsl";
         const titles = await fetchSourceTitle(apiEndpoint);
         setTitles(titles);
      };

      // Call fetchTitle immediately when the component mounts
      fetchTitle();

      // Set up an interval to call it every 5 seconds
      const intervalId = setInterval(fetchTitle, 5000);

      // Clear the interval when the component unmounts
      return () => clearInterval(intervalId);
   }, []); // Empty dependency array means this effect runs once on mount

   return (
      <>
         {titles.map((title, index) => (
            <span key={index} className="px-2 font-argentumSansLight" data-tip={title}>
               {title}
            </span>
         ))}
      </>
   );
};

export default PlayerDisplay;