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

export async function GetEpisodeById(episodeId: number) {
    const episode = await CmsApiService.Show.getEpisodeById(episodeId);
    return episode;
}