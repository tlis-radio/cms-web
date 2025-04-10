import SwiperCarousel from "@/components/carousel";

import { createDirectus, readItems, rest } from '@directus/sdk';
const directus = createDirectus('http://directus.tlis.sk').with(rest());

export default async function Home() {

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
  ));

  return (
    <div>
      <SwiperCarousel carouselPosts={carouselPosts}/>
    </div>
  );
}
