"use server";
import CmsApiService from "@/services/cms-api-service";

export async function loadMoreEpisodes(showId: string, page: number) {
    const episodes = await CmsApiService.Show.getShowEpisodesByIdPaginated(
        showId,
        page
    );

    return {
        episodes,
        totalCount: episodes.totalCount
    };
}