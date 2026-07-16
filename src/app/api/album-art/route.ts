function normalize(value: string): string {
   return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
}

function fuzzyMatch(a: string, b: string): boolean {
   const na = normalize(a);
   const nb = normalize(b);
   if (!na || !nb) return false;
   return na.includes(nb) || nb.includes(na);
}

interface DeezerTrack {
   title: string;
   artist: { name: string };
   album: { cover_xl?: string; cover_big?: string; cover_medium?: string };
}

export async function GET(request: Request) {
   const headers = new Headers({ "Cache-Control": "no-store", "Content-Type": "application/json" });
   const { searchParams } = new URL(request.url);
   const artist = searchParams.get("artist")?.trim() || "";
   const title = searchParams.get("title")?.trim() || "";

   if (!title) {
      return new Response(JSON.stringify({ artworkUrl: null }), { status: 200, headers });
   }

   try {
      const query = artist ? `${artist} ${title}` : title;
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`, { cache: "no-store" });
      const result: { data?: DeezerTrack[] } = await response.json();

      const match = (result.data || []).find((item) => {
         const titleMatches = fuzzyMatch(item.title, title);
         const artistMatches = !artist || fuzzyMatch(item.artist.name, artist);
         return titleMatches && artistMatches;
      });

      const artworkUrl = match
         ? match.album.cover_xl || match.album.cover_big || match.album.cover_medium || null
         : null;

      return new Response(JSON.stringify({ artworkUrl }), { status: 200, headers });
   } catch (err) {
      return new Response(JSON.stringify({ artworkUrl: null }), { status: 200, headers });
   }
}

export const dynamic = "force-dynamic";
