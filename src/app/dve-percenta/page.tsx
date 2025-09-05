export default function DvePercenta() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg flex flex-col items-center">
            <h1 className='font-argentumSansMedium text-3xl md:text-4xl tracking-[10px] uppercase mb-8 text-center'>Dve percentá</h1>
            <p className="font-argentumSansRegular text-lg leading-relaxed mb-6">Podporte naše študentské rádio TLIS poukázaním 2% z Vašich daní. Vaša podpora nám pomáha pokračovať v našej činnosti a rozvíjať nové projekty.</p>

            <h2 className="text-xl font-semibold mb-2 text-[#d43c4a]">ÚDAJE POTREBNÉ NA POUKÁZANIE 2%</h2>
            <div className="text-left">
                <ul className="mb-6 list-none list-inside">
                    <li><b>IČO/SID:</b> 42445833</li>
                    <li><b>Právna forma:</b> občianske združenie</li>
                    <li><b>Obchodné meno/názov:</b> IRŠ TLIS</li>
                    <li><b>Ulica:</b> STARÉ GRUNTY</li>
                    <li><b>Číslo:</b> 5913/53</li>
                    <li><b>PSČ:</b> 841 04</li>
                    <li><b>Obec:</b> BRATISLAVA - KARLOVA VES</li>
                </ul>
            </div>

            <h2 className="text-xl font-semibold mb-2 text-[#d43c4a]">Som zamestnanec</h2>
            <p className="mb-6">(Váš zamestnávateľ bude robiť daňové priznanie za vás)</p>

            <h2 className="text-xl font-semibold mb-2 text-[#d43c4a]">TLAČIVÁ NA STIAHNUTIE PRE ZAMESTNANCA</h2>
            <ul className="mb-6 list-none list-inside">
                <li className="flex items-center mb-2 flex-wrap justify-center">
                    <svg className="w-5 h-5 text-[#d43c4a] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 11.172 2H6zm5 1.414L16.586 9H13a2 2 0 0 1-2-2V3.414z"/>
                    </svg>
                    <a href="#" className="text-white underline" download>
                        Potvrdenie o zaplatení dane – PDF na stiahnutie
                    </a>
                </li>
                <li className="flex items-center flex-wrap justify-center">
                    <svg className="w-5 h-5 text-[#d43c4a] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 11.172 2H6zm5 1.414L16.586 9H13a2 2 0 0 1-2-2V3.414z"/>
                    </svg>
                    <a href="#" className="text-white underline" download>
                        Vyhlásenie 2-3 % – PDF na stiahnutie
                    </a>
                </li>
            </ul>

            <p className="text-sm text-gray-200">Ak potrebujete pomoc s vyplnením tlačív, kontaktujte nás.</p>
        </div>
    );
}
