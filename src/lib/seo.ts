export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// Obsah je len po slovensky — /en, /de, /uk… prekladajú iba UI. Všetky jazykové
// verzie preto kanonicky ukazujú na /sk, aby si Google nedelil ranking medzi prefixy.
export const CANONICAL_LOCALE = "sk";

type SearchParam = string | string[] | undefined;

// Stránka z ?page — neplatné hodnoty (abc, 0, -1) sa berú ako 1
export function parsePage(param: SearchParam): number {
   const raw = Array.isArray(param) ? param[0] : param;
   const page = parseInt(raw || "1", 10);
   return Number.isFinite(page) && page > 1 ? page : 1;
}

// Kanonická URL v jednotnom tvare: vždy /sk, bez ?page=1, parametre v rovnakom poradí
export function pageUrl(path: string, query: Record<string, string | number | undefined> = {}): string {
   const search = new URLSearchParams();
   for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === "") continue;
      if (key === "page" && Number(value) <= 1) continue;
      search.set(key, String(value));
   }
   const qs = search.toString();
   return `${SITE_URL}/${CANONICAL_LOCALE}${path}${qs ? `?${qs}` : ""}`;
}

// Bez hreflang — jazykové verzie nie sú preklady obsahu
export function alternatesFor(path: string, query: Record<string, string | number | undefined> = {}) {
   return { canonical: pageUrl(path, query) };
}
