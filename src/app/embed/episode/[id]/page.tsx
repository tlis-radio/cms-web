import CmsApiService from "@/services/cms-api-service";
import EpisodeWidget from "../../widgets/EpisodeWidget";
import { notFound } from "next/navigation";

interface EpisodeEmbedPageProps {
  params: Promise<{ id: string }>;
}

export default async function EpisodeEmbedPage({ params }: EpisodeEmbedPageProps) {
  const { id } = await params;

  try {
    const episode = await CmsApiService.Show.getEpisodeById(parseInt(id));
    if (!episode) notFound();

    // Try to get the show for this episode
    let show = null;
    try {
      show = await CmsApiService.Show.getShowByEpisodeId(parseInt(id));
    } catch (e) {
      // Show not found, continue without it
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EpisodeWidget
          episode={{
            id: Number(episode.id),
            Title: episode.Title,
            Cover: episode.Cover,
            Audio: episode.Audio?.id,
            Date: episode.Date,
            Views: episode.Views,
            Description: (episode as any).Description ?? undefined,
          }}
          show={show ? { Slug: show.Slug, Title: show.Title } : undefined}
        />
      </div>
    );
  } catch (error) {
    notFound();
  }
}

export const dynamic = "force-dynamic";
