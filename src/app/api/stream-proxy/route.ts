const STREAM_URL = "https://stream.tlis.sk/tlis.mp3";
const STREAM_AUTH_USERNAME = "tlis";

export async function GET(request: Request) {
   const { searchParams } = new URL(request.url);
   const password = searchParams.get("password");

   const headers: HeadersInit = {};
   if (password) {
      headers["Authorization"] = `Basic ${Buffer.from(`${STREAM_AUTH_USERNAME}:${password}`).toString("base64")}`;
   }

   let upstream: Response;
   try {
      upstream = await fetch(STREAM_URL, { headers, cache: "no-store", signal: request.signal });
   } catch (err) {
      console.error("Failed to reach stream:", err);
      return new Response(null, { status: 502 });
   }

   if (!upstream.ok || !upstream.body) {
      return new Response(null, { status: upstream.status });
   }

   return new Response(upstream.body, {
      status: upstream.status,
      headers: {
         "Content-Type": upstream.headers.get("Content-Type") || "audio/mpeg",
         "Cache-Control": "no-store",
      },
   });
}

export const dynamic = "force-dynamic";
