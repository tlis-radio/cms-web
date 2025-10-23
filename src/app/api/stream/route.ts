import CmsApiService from "@/services/cms-api-service";

export async function GET(request: Request) {
    
    const currentStreamTitle = await CmsApiService.Stream.getCurrentStreamTitle();
    if (currentStreamTitle) return new Response(currentStreamTitle);

    return new Response(null);
}