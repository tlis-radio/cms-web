import CmsApiService from "@/services/cms-api-service";

export async function GET(request: Request) {
    const currentStreamTitle = await CmsApiService.Stream.getCurrentStreamTitle();
    const headers = new Headers({ "Cache-Control": "no-store" });
    
    if (currentStreamTitle) return new Response(currentStreamTitle, { status: 200, headers });
    return new Response(null, { status: 204, headers });
}

export const dynamic = "force-dynamic";