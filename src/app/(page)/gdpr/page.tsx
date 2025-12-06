import React from "react";

export default function GdprPage() {
  return (
    <>
      <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8">
        GDPR a ochrana osobných údajov
      </h1>
      <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">
        <div className="flex flex-col gap-8 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>1. Spracúvanie osobných údajov</strong>
              <br />
              Naša služba nezhromažďuje žiadne osobné údaje používateľov.
              Používané sú výlučne anonymizované štatistiky počúvania rádia,
              ktoré slúžia na analytické účely a zlepšovanie kvality
              poskytovaných služieb. Tieto štatistiky neumožňujú identifikáciu
              jednotlivých osôb.
            </p>
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>2. Cookies a identifikátor relácie</strong>
              <br />
              Služba používa súbory cookies na uloženie identifikátora relácie
              (sessionId). Tento identifikátor umožňuje správne fungovanie
              prehrávača a zachovanie vašej relácie. SessionId neobsahuje žiadne
              osobné údaje a je používaný výhradne na technické účely.
            </p>
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>3. Zabezpečenie údajov</strong>
              <br />
              Anonymizované štatistiky a sessionId sú spracovávané a uchovávané
              bezpečne v súlade s platnými právnymi predpismi, vrátane GDPR. K
              údajom majú prístup len oprávnené osoby a sú chránené proti
              neoprávnenému prístupu.
            </p>
            <p className="font-argentumSansRegular text-lg leading-relaxed">
              <strong>4. Práva používateľov</strong>
              <br />
              Používatelia majú právo na prístup k údajom, ktoré o nich neboli
              zhromaždené, ako aj právo podať sťažnosť u dozorného orgánu, ak
              majú podozrenie, že došlo k porušeniu ochrany osobných údajov.
              Vzhľadom na anonymný charakter zhromažďovaných údajov nie je možné
              identifikovať konkrétne osoby.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
