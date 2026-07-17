export type TourStep = {
   targetSelector: string;
   title: string;
   body: string;
   placement?: 'right' | 'bottom' | 'top';
};

export const TOUR_STEPS: TourStep[] = [
   {
      targetSelector: '[data-tour="sidebar-nav"]',
      title: 'Navigácia',
      body: 'Tu nájdeš všetky sekcie dashboardu — Prehľad, Relácie, Poslucháči vysielania, Zdieľania a Poslucháči.',
      placement: 'right',
   },
   {
      targetSelector: '[data-tour="filter-bar"]',
      title: 'Filtre',
      body: 'Filtre a prepínače časového rozsahu sú teraz vždy hore vpravo a zostávajú viditeľné pri scrollovaní.',
      placement: 'bottom',
   },
   {
      targetSelector: '[data-tour="list-density"]',
      title: 'Zoznamy',
      body: 'Zoznamy zobrazujú viac dát na obrazovku naraz — kliknutím sa dostaneš na detail.',
      placement: 'top',
   },
   {
      targetSelector: '[data-tour="whats-new"]',
      title: 'Čo je nové',
      body: 'Zmeny a dôležité upozornenia k dátam nájdeš kedykoľvek tu.',
      placement: 'top',
   },
];
