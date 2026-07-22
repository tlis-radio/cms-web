export type TourStep = {
   targetSelector: string;
   title: string;
   body: string;
   placement?: 'right' | 'bottom' | 'top' | 'left';
};

export type TourRelatedLink = {
   label: string;
   href: string | ((pathname: string) => string);
};

export type TourDefinition = {
   /** Unique id — used as the per-tour "seen" cookie key, so each page tour is shown once independently. */
   id: string;
   steps: TourStep[];
   /** Offered at the last step: "quit the tour" or jump to a related page. */
   related?: TourRelatedLink[];
};

export function resolveHref(href: TourRelatedLink['href'], pathname: string): string {
   return typeof href === 'function' ? href(pathname) : href;
}

/** Strips the last path segment, e.g. /dashboard/shows/podzemie/737 -> /dashboard/shows/podzemie */
const parentPath = (pathname: string) => pathname.replace(/\/[^/]+\/?$/, '');

const HOME_TOUR: TourDefinition = {
   id: 'home',
   steps: [
      {
         targetSelector: '[data-tour="sidebar-nav"]',
         title: 'Navigácia',
         body: 'Tu nájdeš všetky sekcie dashboardu — Prehľad, Relácie, Poslucháči vysielania, Zdieľania a Poslucháči.',
         placement: 'right',
      },
      {
         targetSelector: '[data-tour="time-filter"]',
         title: 'Časový rozsah',
         body: 'Prepínač časového rozsahu ovplyvňuje načítané dáta v tomto stĺpci.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="home-widgets"]',
         title: 'Rýchly prehľad',
         body: 'Porovnanie za posledné obdobie nastavené v časovom rozsahu. Po kliknutí prejdeš na konkrétnu sekciu dashboardu s detailnejšími dátami.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="home-profile"]',
         title: 'Tvoj profil',
         body: 'Tu máš rýchly prístup ku tvojim reláciám a dátum poslednej epizódy.',
         placement: 'left',
      },
      {
         targetSelector: '[data-tour="home-recent-episodes"]',
         title: 'Posledné epizódy',
         body: 'Zoznam posledných odvysielaných relácií. Kliknutím na epizódu sa dostaneš do jej detailnej analytiky.',
      },
      {
         targetSelector: '[data-tour="home-listener-activity"]',
         title: 'Aktivita poslucháčov',
         body: 'Graf zobrazujúci aktivitu poslucháčov vo vybranom časovom rozsahu.',
      },
      {
         targetSelector: '[data-tour="home-top-shows"]',
         title: 'Top relácie',
         body: 'Prehľad top relácií, ktoré udržali najvyššiu úroveň počúvania relácie. Klikni na epizódu pre detailný graf.',
      },
      {
         targetSelector: '[data-tour="home-retention-graph"]',
         title: 'Miera udržania',
         body: 'Graf zobrazuje, koľko poslucháčov sa dopočulo do daného bodu nahrávky. Prudký pokles ukazuje, kde ľudia najčastejšie prestávajú počúvať.',
      },
      {
         targetSelector: '[data-tour="home-trending"]',
         title: 'Trendujúce relácie',
         body: 'Zoznam relácií, ktoré zaznamenali najväčší počet poslucháčov vo vybranom časovom rozsahu. Kliknutím na epizódu sa dostaneš do jej detailnej analytiky.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="home-top-creators"]',
         title: 'Top tvorcovia',
         body: 'Zoznam tvorcov, ktorých relácie zaznamenali najvyšší čas počúvania vo vybranom časovom rozsahu.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="whats-new"]',
         title: 'Čo je nové',
         body: 'Zmeny a dôležité upozornenia k dátam nájdeš kedykoľvek tu.',
         placement: 'top',
      },
   ],
   related: [
      {
         label: 'Ukázať analytiku konkrétnej epizódy',
         href: '/dashboard/shows/podzemie/737',
      },
   ],
};

const SHOWS_LIST_TOUR: TourDefinition = {
   id: 'shows-list',
   steps: [
      {
         targetSelector: '[data-tour="shows-filter"]',
         title: 'Filter relácií',
         body: 'Prepínaj medzi aktívnymi, archívnymi a starým digitálnym archívom relácií.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="shows-grid"]',
         title: 'Zoznam relácií',
         body: 'Klikni na reláciu a zobrazíš zoznam jej epizód spolu s počtom vypočutí.',
         placement: 'top',
      },
   ],
   related: [
      { label: 'Poslucháči vysielania', href: '/dashboard/stream-listeners' },
   ],
};

const SHOW_DETAIL_TOUR: TourDefinition = {
   id: 'show-detail',
   steps: [
      {
         targetSelector: '[data-tour="show-header"]',
         title: 'O relácii',
         body: 'Základné informácie o relácii — popis, obsadenie a celkový počet epizód.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="episode-sort"]',
         title: 'Zoradenie epizód',
         body: 'Zoraď epizódy podľa dátumu vydania alebo podľa počtu vypočutí, vzostupne alebo zostupne.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="episode-list"]',
         title: 'Zoznam epizód',
         body: 'Klikni na epizódu a zobrazíš jej detailnú analytiku — grafy zapojenia a mieru udržania poslucháčov.',
         placement: 'top',
      },
   ],
   related: [
      { label: 'Späť na zoznam relácií', href: '/dashboard/shows' },
      { label: 'Poslucháči vysielania', href: '/dashboard/stream-listeners' },
   ],
};

const EPISODE_TOUR: TourDefinition = {
   id: 'episode',
   steps: [
      {
         targetSelector: '[data-tour="episode-header"]',
         title: 'Epizóda',
         body: 'Základné info o epizóde — a rovno si ju môžeš aj vypočuť.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="episode-stats"]',
         title: 'Súhrn',
         body: 'Rýchly prehľad: počet vypočutí, zdieľaní a poslucháčov — zvlášť z archívu a zvlášť naživo.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="episode-engagement-chart"]',
         title: 'Zapojenie v čase',
         body: 'Počet vypočutí a zdieľaní podľa hodiny. Prerušovaná čiara označuje dátum vydania epizódy.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="episode-retention-chart"]',
         title: 'Miera udržania (archív)',
         body: 'Percento poslucháčov, ktorí sa dopočuli do daného bodu nahrávky pri počúvaní z archívu. Prudký pokles ukazuje, kde ľudia najčastejšie prestávajú počúvať.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="episode-stream-retention-chart"]',
         title: 'Miera udržania (naživo)',
         body: 'Rovnaký pohľad, ale pre poslucháčov, ktorí epizódu počúvali naživo počas vysielania.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="episode-listeners"]',
         title: 'Jednotliví poslucháči',
         body: 'Zoznam konkrétnych relácií počúvania. Klikni na jednu z nich a zobrazíš detail daného poslucháča.',
         placement: 'top',
      },
   ],
   related: [
      { label: 'Späť na zoznam epizód', href: parentPath },
      { label: 'Poslucháči vysielania', href: '/dashboard/stream-listeners' },
   ],
};

const TRACK_SHARES_TOUR: TourDefinition = {
   id: 'track-shares',
   steps: [
      {
         targetSelector: '[data-tour="shares-stats"]',
         title: 'Súhrn zdieľaní',
         body: 'Celkový počet zdieľaní, počet unikátnych zdieľaných epizód a tá najzdieľanejšia.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="filter-bar"]',
         title: 'Časový rozsah',
         body: 'Vyber si obdobie, za ktoré chceš vidieť graf a rebríček nižšie.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="shares-chart"]',
         title: 'Zdieľania v čase',
         body: 'Vývoj počtu zdieľaní za zvolené obdobie.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="shares-top"]',
         title: 'Najzdieľanejšie epizódy',
         body: 'Rebríček epizód podľa počtu zdieľaní za zvolené obdobie.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="shares-table"]',
         title: 'Posledné zdieľania',
         body: 'Podrobný zoznam najnovších zdieľaní so značkou času.',
         placement: 'top',
      },
   ],
   related: [
      { label: 'Poslucháči vysielania', href: '/dashboard/stream-listeners' },
      { label: 'Poslucháči', href: '/dashboard/users' },
   ],
};

const USERS_TOUR: TourDefinition = {
   id: 'users',
   steps: [
      {
         targetSelector: '[data-tour="filter-bar"]',
         title: 'Filter a zoradenie',
         body: 'Zúž zoznam na konkrétnu reláciu a zoraď poslucháčov podľa poslednej aktivity alebo počtu odpočutých epizód.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="users-bounce"]',
         title: 'Jednorazoví vs. vracajúci sa',
         body: 'Jednorazový poslucháč (bounce). Bez súhlasu s cookies môžu byť čísla skreslené — poslucháč dostane pri každej návšteve nové ID.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="users-charts"]',
         title: 'Rozloženie počúvania',
         body: 'Koľko epizód si poslucháči v priemere vypočujú a aké percento nahrávky im typicky vydrží pozornosť.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="users-table"]',
         title: 'Zoznam poslucháčov',
         body: 'Klikni na Detail pri poslucháčovi a zobrazíš kompletnú históriu jeho počúvania.',
         placement: 'top',
      },
   ],
   related: [
      { label: 'Poslucháči vysielania', href: '/dashboard/stream-listeners' },
      { label: 'Zdieľania', href: '/dashboard/track-shares' },
   ],
};

const STREAM_LISTENERS_TOUR: TourDefinition = {
   id: 'stream-listeners',
   steps: [
      {
         targetSelector: '[data-tour="stream-stats"]',
         title: 'Súhrn naživo',
         body: 'Súbežní poslucháči za zvolené obdobie, historická špička a posledné vysielanie.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="filter-bar"]',
         title: 'Časový rozsah',
         body: 'Vyber si obdobie, za ktoré chceš vidieť graf súbežných poslucháčov.',
         placement: 'bottom',
      },
      {
         targetSelector: '[data-tour="stream-chart"]',
         title: 'Poslucháči v čase',
         body: 'Maximálny počet súbežných poslucháčov v danom časovom úseku.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="stream-last"]',
         title: 'Posledné vysielanie',
         body: 'Detail posledného vysielania — špička a priemer súbežných poslucháčov, unikátni poslucháči a trvanie.',
         placement: 'top',
      },
      {
         targetSelector: '[data-tour="stream-top"]',
         title: 'Najlepšie epizódy naživo',
         body: 'Rebríček epizód podľa počtu unikátnych poslucháčov počas živého vysielania.',
         placement: 'top',
      },
   ],
   related: [
      { label: 'Zdieľania', href: '/dashboard/track-shares' },
      { label: 'Poslucháči', href: '/dashboard/users' },
   ],
};

const DEFAULT_TOUR: TourDefinition = {
   id: 'default',
   steps: [
      {
         targetSelector: '[data-tour="sidebar-nav"]',
         title: 'Navigácia',
         body: 'Tu nájdeš všetky sekcie dashboardu — Prehľad, Relácie, Poslucháči vysielania, Zdieľania a Poslucháči.',
         placement: 'right',
      },
   ],
};

const EPISODE_RE = /\/dashboard\/shows\/[^/]+\/[^/]+\/?$/;
const SHOW_DETAIL_RE = /\/dashboard\/shows\/[^/]+\/?$/;
const SHOWS_LIST_RE = /\/dashboard\/shows\/?$/;
const TRACK_SHARES_RE = /\/dashboard\/track-shares\/?$/;
const USERS_RE = /\/dashboard\/users\/?$/;
const STREAM_LISTENERS_RE = /\/dashboard\/stream-listeners\/?$/;
const HOME_RE = /\/dashboard\/?$/;

export function getTourForPath(pathname: string): TourDefinition {
   if (EPISODE_RE.test(pathname)) return EPISODE_TOUR;
   if (SHOW_DETAIL_RE.test(pathname)) return SHOW_DETAIL_TOUR;
   if (SHOWS_LIST_RE.test(pathname)) return SHOWS_LIST_TOUR;
   if (TRACK_SHARES_RE.test(pathname)) return TRACK_SHARES_TOUR;
   if (USERS_RE.test(pathname)) return USERS_TOUR;
   if (STREAM_LISTENERS_RE.test(pathname)) return STREAM_LISTENERS_TOUR;
   if (HOME_RE.test(pathname)) return HOME_TOUR;
   return DEFAULT_TOUR;
}
