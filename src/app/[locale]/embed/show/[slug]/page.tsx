import CmsApiService from "@/services/cms-api-service";
import ShowListWidget from "../../widgets/ShowListWidget";
import { notFound } from "next/navigation";

interface ShowEmbedPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShowEmbedPage({ params }: ShowEmbedPageProps) {
  const { slug } = await params;

  try {
    const show = await CmsApiService.Show.getShowBySlug(slug);
    const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(
      String(show.id),
      0
    );

    return (
      <ShowListWidget
        show={{
          id: Number(show.id),
          Title: show.Title,
          Cover: show.Cover,
          Slug: show.Slug,
          Description: show.Description,
        }}
        episodes={episodeData.episodes.map((episode) => ({
          id: Number(episode.id),
          Title: episode.Title,
          Cover: episode.Cover,
          Audio: episode.Audio?.id,
          Date: episode.Date,
          Views: episode.Views,
        }))}
        totalCount={episodeData.totalCount}
      />
    );
  } catch (error) {
    notFound();
  }
}

export const dynamic = "force-dynamic";
