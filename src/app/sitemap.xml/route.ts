import CmsApiService from '@/services/cms-api-service';

const STATIC_ROUTES: string[] = [
  '/',
  '/dve-percenta',
  '/gdpr',
  '/konkurz',
  '/o-radiu',
  '/program',
  '/relacie',
  '/tos'
];

function buildSitemap(urls: string[], baseUrl: string): string {
  const allUrls = urls.map(u => `${baseUrl.replace(/\/$/, '')}${u}`);
  const items = allUrls
    .map(u => `  <url>\n    <loc>${u}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;
}

export async function GET() {
  // Fetch shows via CmsApiService to get slugs (uses server-side Directus instance)
  let showSlugs: string[] = [];
  try {
    const shows = await CmsApiService.Show.listShows();
    if (Array.isArray(shows)) {
      showSlugs = shows.map((s: any) => s.Slug).filter(Boolean);
    }
  } catch (err) {
    console.error('Error fetching shows for sitemap via CmsApiService:', err);
    showSlugs = [];
  }

  const dynamicRelacie = showSlugs.map(s => `/relacie/${s}`);

  const urls = Array.from(new Set([...STATIC_ROUTES, ...dynamicRelacie])).sort();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:3000';
  const xml = buildSitemap(urls, baseUrl);

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}
