import SwiperCarousel from "@/components/carousel";

import { readItems } from '@directus/sdk';
import CmsApiService, { getDirectusInstance } from "@/services/cms-api-service";

export default async function Program() {
    var loadingError = false;

    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    const threeDaysAhead = new Date(today);
    threeDaysAhead.setDate(today.getDate() + 3);

    const carouselPosts = await getDirectusInstance().request(readItems('Episodes', {
            filter: {
                Date: {
                    _between: [threeDaysAgo.toDateString(), threeDaysAhead.toDateString()],
                },
            },
            sort: ['Date'],
        }
    )).catch((error) => {
        console.error("Error fetching episodes:", error);
        loadingError = true;
        return [];
    });

    if (Array.isArray(carouselPosts)) {
        await Promise.all(carouselPosts.map(async (episode) => {
            try {
                const show = await CmsApiService.Show.getShowByEpisodeId(episode.id);
                (episode as any).showData = show;
            } catch (error) {
                console.error("Error fetching show for episode:", error);
            }
        }));
    }

    return (<SwiperCarousel carouselPosts={carouselPosts} loadingError={loadingError} />);
}
