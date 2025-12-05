import CmsApiService from "@/services/cms-api-service";
import ShowListWidget from "../../widgets/ShowListWidget";
import { notFound } from "next/navigation";

interface ShowEmbedPageProps {
  params: { slug: string };
}

export default async function ShowEmbedPage({ params }: ShowEmbedPageProps) {
  const { slug } = params;

  try {
    const show = await CmsApiService.Show.getShowBySlug(slug);
    const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(
      String(show.id),
      0
    );

    return (
      <ShowListWidget
        show={{
          id: show.id,
          Title: show.Title,
          Cover: show.Cover,
          Slug: show.Slug,
          Description: show.Description,
        }}
        episodes={episodeData.episodes}
        totalCount={episodeData.totalCount}
      />
    );
  } catch (error) {
    notFound();
  }
}

export const dynamic = "force-dynamic";
