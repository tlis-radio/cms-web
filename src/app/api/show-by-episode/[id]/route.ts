import CmsApiService from '@/services/cms-api-service';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    const episodeId = Number(id);
    if (Number.isNaN(episodeId)) {
      return NextResponse.json({ error: 'Invalid episode id' }, { status: 400 });
    }

    const show = await CmsApiService.Show.getShowByEpisodeId(episodeId);
    if (!show) return NextResponse.json({ error: 'Show not found' }, { status: 404 });

    return NextResponse.json({ slug: show.Slug });
  } catch (err) {
    console.error('Error resolving show by episode id', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
