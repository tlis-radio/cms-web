import { SITE_URL, CANONICAL_LOCALE } from '@/lib/seo';

// OpenSearch popis — prehliadače (Chrome, Firefox, Edge) podľa neho ponúknu
// vyhľadávanie priamo z adresného riadku: "tlis.sk <Tab> hľadaný výraz" -> /sk/relacie?q=...
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>Radio TLIS</ShortName>
  <Description>Vyhľadávanie relácií Radia TLIS</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Language>sk</Language>
  <Image width="16" height="16" type="image/x-icon">${SITE_URL}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${SITE_URL}/${CANONICAL_LOCALE}/relacie?q={searchTerms}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="${SITE_URL}/opensearch.xml"/>
  <moz:SearchForm>${SITE_URL}/${CANONICAL_LOCALE}/relacie</moz:SearchForm>
</OpenSearchDescription>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
