import CmsApiService from "@/services/cms-api-service";
import { Root } from "@/types/streamstatus";


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

export async function GET(request: Request) {
    const headers = new Headers({ "Cache-Control": "no-store" });
    
    const currentStreamTitle = await CmsApiService.Stream.getCurrentStreamTitle();
    if (currentStreamTitle) return new Response(currentStreamTitle, { status: 200, headers });

    const apiEndpoint = process.env.ICECAST_ENDPOINT;
    if (!apiEndpoint) return new Response("Neznáme rádio", { status: 200, headers });
    
    const parts = await fetchSourceTitle(apiEndpoint);
    if (parts.length === 0) return new Response("Neznáme rádio", { status: 200, headers });
    return new Response(parts.join(" "), { status: 200, headers });
}

export const dynamic = "force-dynamic";