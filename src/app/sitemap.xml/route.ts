import CmsApiService from '@/services/cms-api-service';

import { locales } from '@/navigation';

const STATIC_ROUTES: string[] = [
  '/',
  '/dve-percenta',
  '/gdpr',
  '/konkurz',
  '/o-radiu',
  '/program',
  '/relacie',
  '/tos',
  '/dashboard',
  '/embed'
];

function buildSitemap(urls: string[], baseUrl: string): string {
  const items = urls
    .map(u => `  <url>\n    <loc>${baseUrl}${u}</loc>\n  </url>`)
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
    showSlugs = [];
  }
  
  const dynamicRelacie = showSlugs.map(s => `/relacie/${s}`);

  const basePaths = Array.from(new Set([...STATIC_ROUTES, ...dynamicRelacie])).sort();

  const localizedUrls: string[] = [];
  basePaths.forEach(path => {
    locales.forEach(locale => {
      const fullPath = path === '/' ? `/${locale}` : `/${locale}${path}`;
      localizedUrls.push(fullPath);
    });
  });

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tlis.sk').replace(/\/$/, '');
  const xml = buildSitemap(localizedUrls, baseUrl);
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml' },
  });
}

export const dynamic = "force-dynamic";