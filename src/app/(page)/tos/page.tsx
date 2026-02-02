import React from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function TosPage() {
  const breadcrumbs = [
    { label: "Podmienky používania", href: "/tos" }
  ];

  return (
    <>
      <div className="px-8 mb-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>
<h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> Podmienky používania podcastov</h1>
      <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">
        <div className="flex flex-col gap-8 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>1. Vlastnícke práva</strong><br/>
              Všetky podcasty publikované na tejto platforme sú výlučne naším vlastníctvom a sú chránené autorským právom. Žiadna časť podcastov nesmie byť reprodukovaná, distribuovaná alebo inak používaná bez výslovného povolenia, pokiaľ nie je uvedené inak.
            </p>
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>2. Zdieľanie a redistribúcia</strong><br/>
              Podcasty môžu byť zdieľané alebo redistribuované len v prípade, že je uvedená primeraná atribúcia autorovi a zdroju. Bez uvedenia atribúcie je takéto použitie zakázané.
            </p>
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>3. Zodpovednosť používateľa</strong><br/>
              Používatelia sú zodpovední za dodržiavanie týchto podmienok pri akejkoľvek interakcii s obsahom podcastov. Porušenie autorských práv alebo pravidiel zdieľania môže viesť k právnym krokom.
            </p>
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>4. Zmeny podmienok</strong><br/>
              Vyhradzujeme si právo kedykoľvek upraviť tieto podmienky. Aktualizácie budú zverejnené na tejto stránke a pokračovaním v používaní služby súhlasíte s novými podmienkami.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
