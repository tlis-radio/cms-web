import React from 'react';
import tlisaci from '@/../public/images/tlisaci.jpg';

const AboutUs: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-white">
            <h1 className='font-argentumSansMedium text-3xl md:text-4xl tracking-[10px] uppercase mb-8 text-center'>
                O nás
            </h1>

            <div className="flex flex-col gap-8 mb-12 items-center">
                <div className="space-y-4 order-2 md:order-1">
                    <p className='font-argentumSansRegular text-lg leading-relaxed'>
                        Od pondelka do piatku, každý večer od 19:00 do polnoci - živé vysielanie: live rozhovory, reportáže, talkshow, hudobné aj filmové recenzie, zaujímaví ľudia z mimovládok a subkultúr, hudobné sety... Alternatívna scéna, hudba, divadlo, filmy, talkshow... Počas dňa nonstop playlist alternatívnej hudby.
                    </p>
                    <p className='font-argentumSansRegular text-lg leading-relaxed'>
                        Ak máte chuť na kvalitnú alternatívu - zapnite si IRŠ TLIS! :)
                    </p>
                </div>
                <img 
                    src={tlisaci.src} 
                    alt="Tlispyčy :)" 
                    className='rounded-xl w-full h-auto object-cover shadow-lg order-1 md:order-2'
                />
            </div>

            {/* Main content */}
            <div className="font-argentumSansRegular space-y-8 text-lg leading-relaxed">
                <section className="space-y-4">
                    <h2 className="font-argentumSansMedium text-2xl md:text-3xl mb-4">História a súčasnosť</h2>
                    <p><b>Internetové Rádio Študentov TisícLôžkovej Internátnej Stavby (IRŠ TLIS)</b> vysiela z Internátov Mladosť na Mlynskej Doline už viac ako 35 rokov. V súčasnosti je to jediné študentské rádio (IRŠ) v Bratislave a jediné študentské rádio na Slovensku so zameraním na alternatívnu hudbu a kultúru.</p>
                    <p>Predchodcom IRŠ TLIS je študentské rádio <b>IRŠ MG</b> so sídlom na internáte Mladá Garda. Vysielať začalo IRŠ MG už 22. augusta 1967, neskôr ako <b>IRŠ MD</b>). V roku 1981 sa po dostavbe nových internátnych domov v Mlynskej doline IRŠ MD rozdelilo na <b>IRŠ MD1</b> a <b>IRŠ TLIS</b>. IRŠ MD1 neskôr zaniká, podobne ako ostatné IRŠká v Bratislave.</p>
                    <p>IRŠ TLIS začalo vysielať v decembri roku 1981, jeho nezvyčajné posolstvo sa šírilo prostredníctvom búdiek prítomných na každej izbe internátu. Vďaka vysielaniu zakázanej západnej hudby a prezentácii uvoľnenej kultúry si mladé rádio rýchlo našlo stúpencov z radov študentov a naopak, nepriateľov na strane úradujúceho komunistického režimu. Zavrieť štúdiá sa však nikdy nepodarilo, s nástupom nových technológií TLIS presedlal v roku 2000 na internetové technológie a začal svoje vysielanie streamovať prostredníctvom internetu.</p>
                    <p>TLIS vysiela hudbu nonstop. Počas zimného a letného semestra sa od pondelka do piatku venujeme tvorbe živých večerných relácií. Témy relácií sa líšia v závislosti od zloženia vysielacieho tímu v daný pracovný deň. Všetky informácie o programe a vysielaní sú pravidelne zverejňované na tejto internetovej stránke a na sociálnych sieťach.</p>
                </section>

                <section className="space-y-4">
                    <p>Programovo aj dramaturgicky sa TLIS približuje do okruhu neznámych a neprebádaných končín na okraji mainstreamu. Naše vysielanie sa snaží byť v kultúrnej a hodnotovej opozícií k vysielaniam komerčných rádií na Slovensku. Prinášame aktuálne kultúrne novinky a prehľad udalostí v Bratislave a mimo nej, sledujeme modernú literatúru a divadlo. Naši redaktori sa venujú súčasnému filmu a hlavne si udržujeme nadštandardný prehľad o dianí na domácej a svetovej hudobnej scéne. Veríme, že pojmy ako "nekomerčnosť", "alternatíva" a "underground" sa už dávno vyprázdnili, a proti týmto neživým pojmom, z ktorých sa stali značky produktov pre mládež, ponúkame život: komunitné a subkultúrne vysielania, rozhovory s mladými tvorcami, spisovateľmi a hudobníkmi, živé prenosy z hudobných a novo-mediálnych festivalov, hĺbkový prehľad o hudbe reprezentujúcej súčasné pohyby, miniprofily a tematické relácie redaktorov/redaktoriek s rozhľadom.</p>
                    <p>Ambíciou TLISu je udržať a rozvinúť svoj vibrujúci vnútorný život. Chceme sa stať demokratickým a multi-kultúrnym médiom, uvedomujúcim si svoju nezávislosť a hodnotový rebríček, na ktorého najvyššom mieste je kultúra, humor a nadhľad.</p>
                    <p>Dúfame, že aj vďaka Vašej priazni sa nám to podarí.</p>
                </section>

                <section className="space-y-4">
                    <p>Z <b>TLISu</b> vyšli ľudia, ktorí sa podieľali na vzniku Fun Radia, Radia Ragtime, Radia Expres, či Radia Twist. Iní majú úspešnú kariéru moderátorov a spíkrov. Okrem toho v priestoroch <b>TLISu</b> v rokoch 1991-1993 sídlilo jedno z prvých nezávislých alternatívnych hudobných vydavateľstiev vo vtedajšom Československu, <a href="http://www.zoonrecords.com/" className="text-[#d43c4a] hover:underline"><b>Zoon Records</b></a>.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="font-argentumSansMedium text-xl md:text-2xl mb-4">Šéfovia</h3>
                    <div className="space-y-2">
                        <p><b>IRŠ MG:</b> Jozef Černý (1969-71), Martin Ducký (1971-72), Karol Farkaš (1975-76), Miloš Laurinec (1976-78), Cyprián Glassa (Cyro, 1978-79), Dušan Vavák (Vavaque, 1979-80), Dušan Budzak (Duško, 1980-81)</p>
                        <p><b>TLIS:</b> Dušan Budzak (Duško, 1981-1983), Ľubomír Tilňák (Sinclair, 1983-1984), Boris Tytykalo? (1984-1985), Stano Žiačik? (Ubo, 1985-1987), Jozef Červeňanský (1988-1989), Imro Valach (1991-1992), Robo Oravec (Omegáč, 1992-1993), Andrej Kladivík (Kladivo, 1993-1994), Pavol Brnoliak (Kauli, 1995-1997), Andrej Kňazovický (Kňazo, 1997-1999), Tóno Březina (Tóno/Žetón, 1999-2002), Marek Vydarený (Mare/Habib, 2001-2004), Dalibor Kocian (Struna/Stroon, 2004-2006), Peter Gonda (gnd/Murdok, 2006-2009), Peter Matkovski (Marshall, 2009-2011), Monika Vozárová (Žaba, 2011-2017), Marek Osrman (2017-...)</p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="font-argentumSansMedium text-2xl md:text-3xl mb-4">Kde nás nájdete?</h2>
                    <p><b>Spoje: 31,39</b> - zastávka: Cintorín Slávičie údolie (konečná)</p>
                    <p>
                        Internáty MLADOSŤ - blok A (za vchodovými dverami do bloku hneď napravo)<br />
                        Staré grunty 53<br />
                        Mlynská Dolina, Bratislava
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;