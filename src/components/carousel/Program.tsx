import SwiperCarousel from "@/components/carousel";

import { readItems } from '@directus/sdk';
import { directus } from "@/services/cms-api-service";

export default async function Program() {
    var loadingError = false;

    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);
    const threeDaysAhead = new Date(today);
    threeDaysAhead.setDate(today.getDate() + 3);

    const carouselPosts = await directus.request(readItems('Episodes',
        {
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

    return (<SwiperCarousel carouselPosts={carouselPosts} loadingError={loadingError} />);
}
