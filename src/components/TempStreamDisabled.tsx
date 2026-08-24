'use client';
import { usePlayer } from "@/context/PlayerContext";

export default function TempStreamDisabled() {
  const { showStreamDisabled, setShowStreamDisabled } = usePlayer();

  const jokes = [
    {
        title: "Multivitamín vytiahol predlžovačku a stream nejde.",
        button: "Prídem na konkurz a pomôžem stream spustiť"
    },
    {
        title: "Kazetka zhodil poistky a stream nejde.",
        button: "Prídem na konkurz a pomôžem stream spustiť"
    },
    {
        title: "Kuň potreboval ísť na záchod a stream omylom vypol.",
        button: "Poviem Kuňovi, aby si dal pozor a pomôžem stream spustiť"
    },
    {
        title: "Jizzus trsal do beatu streamu tak dlho, že sa vypol.",
        button: "Prídem trsať do beatu a pomôžem stream spustiť"
    },
    {
        title: "Bigmac zjedol kábel a stream nejde.",
        button: "Prinesiem mu nový kábel a pomôžem stream spustiť"
    },
    {
        title: "Nosatý potreboval požičať HDMI kábel a zrazu nejde stream.",
        button: "Poviem Nosatému, aby si dal pozor a pomôžem stream spustiť"
    },
    {
        title: "Šabľa presekla kábel a stream nejde.",
        button: "Poviem Šabli, aby si dal pozor a pomôžem stream spustiť" 
    },
    {
        title: "Špachtla zamurovala kábel a stream nejde.",
        button: "Poviem Špachtli, aby si dal pozor a pomôžem stream spustiť"
    },
    {
        title: "Phil sa snažil stremovať cez Wi-Fi a stream sa vypol.",
        button: "Poviem Philovi, aby použil kábel a pomôžem stream spustiť"
    }, 
    {
        title: "Hašiš fotil v štúdiu a jeho blesk vypol stream.",
        button: "Poviem hašišovi, aby prestal fotiť a pomôžem stream spustiť"
    }
  ]

  if (!showStreamDisabled) return null;

  const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center shadow-2xl">

        {/* Content */}
        <h3 className="text-lg font-semibold text-white">Je nám to ľúto, stream je dočasne nedostupný</h3>
        <p className="mt-2 text-sm text-neutral-400">
          {randomJoke.title}
        </p>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowStreamDisabled(false)}
            className="w-full rounded-xl bg-neutral-800 px-4 py-2.5 text-sm font-medium mb-1 text-white hover:bg-neutral-700 active:scale-[0.98] transition-all duration-150"
          >
            {randomJoke.button}
          </button>
        </div>

        <a href="/konkurz">
            <span className="text-xs text-neutral-500">
                Konkurz už 21. septembra v Mlynskej Doline.
            </span>
        </a>
      </div>
    </div>
  );
}