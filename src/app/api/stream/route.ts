import CmsApiService from "@/services/cms-api-service";
import { Root } from "@/types/streamstatus";

const DEFAULT_TITLE = "Radio TLIS";
const HISTORY_LIMIT = 5;

interface TrackInfo {
   artist?: string;
   songTitle?: string;
   idle?: boolean;
}

// Module-scoped so it survives across requests for the lifetime of the server process.
let lastTrack: TrackInfo | null = null;
let trackHistory: TrackInfo[] = [];

function recordTrackChange(current: TrackInfo) {
   if (!current.songTitle || current.songTitle === DEFAULT_TITLE) return;

   const changed = !lastTrack || lastTrack.songTitle !== current.songTitle || lastTrack.artist !== current.artist;
   if (!changed) return;

   if (lastTrack && lastTrack.songTitle && lastTrack.songTitle !== DEFAULT_TITLE) {
      trackHistory = [lastTrack, ...trackHistory].slice(0, HISTORY_LIMIT);
   }
   lastTrack = current;
}

async function fetchSourceTitle(apiEndpoint: string): Promise<TrackInfo> {
   const response = await fetch(apiEndpoint, { cache: "no-store" });
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
      return { artist: undefined, songTitle: undefined, idle: true };
   }
   // Reverse used to switch artist and song title
   var artist, songTitle;
   if (title.includes(" - ")) {
      artist = title.split(" - ")[0]?.trim();
      songTitle = title.split(" - ")[1]?.trim();
   } else {
      artist = undefined;
      songTitle = title.trim();
      return { artist, songTitle };
   }
   return { artist, songTitle };
}

export async function GET(request: Request) {
    const headers = new Headers({ "Cache-Control": "no-store", "Content-Type": "application/json" });

    const currentStreamTitle = await CmsApiService.Stream.getCurrentStreamTitle();
    let result: TrackInfo;

    if (currentStreamTitle) {
        // Parse if it's in "artist - song" format, otherwise return as songTitle only
        const parts = currentStreamTitle.split(" - ");
        result = parts.length >= 2
            ? { artist: parts[0].trim(), songTitle: parts[1].trim() }
            : { artist: undefined, songTitle: currentStreamTitle };
    } else {
        const apiEndpoint = process.env.ICECAST_ENDPOINT;
        result = apiEndpoint ? await fetchSourceTitle(apiEndpoint) : { artist: undefined, songTitle: undefined };
    }

    if (!result.artist && !result.songTitle) {
        result = { ...result, artist: undefined, songTitle: DEFAULT_TITLE };
    }

    recordTrackChange(result);

    return new Response(JSON.stringify({ ...result, history: trackHistory }), { status: 200, headers });
}

export const dynamic = "force-dynamic";
