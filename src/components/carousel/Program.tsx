import SwiperCarousel from "@/components/carousel";

import { readItems } from '@directus/sdk';
import CmsApiService, { getDirectusInstance } from "@/services/cms-api-service";

async function attachShowData(episodes: any[]) {
    await Promise.all(episodes.map(async (episode) => {
        try {
            const show = await CmsApiService.Show.getShowByEpisodeId(episode.id);
            (episode as any).showData = show;
        } catch (error) {
            console.error("Error fetching show for episode:", error);
        }
    }));
}

export default async function Program({ compact = false }: { compact?: boolean }) {
    var loadingError = false;

    const today = new Date();

    const [upcomingEpisodes, recentEpisodes] = await Promise.all([
        getDirectusInstance().request(readItems('Episodes', {
            fields: ["*", "Audio.*"],
            filter: {
                Date: { _gte: today.toDateString() },
                status: { _eq: 'published' },
            },
            sort: ['Date'],
        })).catch((error) => {
            console.error("Error fetching upcoming episodes:", error);
            loadingError = true;
            return [];
        }),
        getDirectusInstance().request(readItems('Episodes', {
            fields: ["*", "Audio.*"],
            filter: {
                Date: { _lt: today.toDateString() },
                status: { _eq: 'published' },
            },
            sort: ['-Date'],
            limit: 10,
        })).catch((error) => {
            console.error("Error fetching recent episodes:", error);
            loadingError = true;
            return [];
        }),
    ]);

    const carouselPosts = [...(recentEpisodes || []).reverse(), ...(upcomingEpisodes || [])];

    if (carouselPosts.length > 0) {
        await attachShowData(carouselPosts);
    }

    return (<SwiperCarousel carouselPosts={carouselPosts} loadingError={loadingError} compact={compact} />);
}
