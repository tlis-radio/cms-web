export type ChangelogEntry = {
   date: string; // 'YYYY-MM-DD'
   title: string;
   body: string;
};

// Newest first.
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
   {
      date: '2026-08-01',
      title: 'Počítame aj anonymných poslucháčov',
      body: 'Od 1. augusta 2026 do štatistík počúvanosti a udržania (retention) zarátavame aj poslucháčov, ktorí neprijali cookies alebo na cookie lištu nikdy neodpovedali. Tým, ktorí súhlas odmietli alebo ho ešte nedali, priraďujeme dočasné (in-memory) session ID namiesto trvalého cookie — vydrží len počas jednej návštevy/reloadu stránky. Očakávajte preto od tohto dátumu mierny nárast v počte jedinečných poslucháčov a session-based metrík, keďže predtým boli títo poslucháči úplne mimo štatistík.',
   },
   {
      date: '2025-12-18',
      title: 'Spustenie nového analytického systému',
      body: 'Všetky dáta udržania poslucháčov (retention) sú počítané od 18.12.2025, kedy bol spustený nový analytický systém. Dáta epizód odvysielaných pred týmto dátumom majú náhodne vygenerované vypočutia (0-50 poslucháčov na epizódu), ktoré nezodpovedajú realite — pri starších epizódach sa riaďte podľa dát udržateľnosti (retention), nie podľa počtu vypočutí. Každá epizóda má vypočutia (možno náhodne generované pred 18.12.2025), živých a archívnych poslucháčov (reálne dáta od tohto dátumu). Poslucháč má priradené anonymné ID a môže mať viacero vypočutí na rôznych epizódach.',
   },
];

export const LATEST_CHANGELOG_DATE = CHANGELOG_ENTRIES[0].date;
