export default function EmbedIndexPage() {
  return (
    <div className="min-h-screen text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Rádio TLIS - Embed Widgets</h1>
        <p className="text-zinc-400 mb-8">
          Táto stránka obsahuje embedovateľné widgety pre Rádio TLIS.
        </p>

        <div className="space-y-4 text-left bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Dostupné widgety:</h2>
          
          <div className="border-b border-zinc-700 pb-4">
            <h3 className="font-medium text-[#d43c4a]">Show List Widget</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Zobrazí zoznam epizód relácie s prehrávačom.
            </p>
            <code className="text-xs text-zinc-500 block mt-2">
              /embed/show/[slug]
            </code>
          </div>

          <div className="border-b border-zinc-700 pb-4">
            <h3 className="font-medium text-[#d43c4a]">Episode Widget</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Kompaktný widget pre jednu epizódu (štvorcový).
            </p>
            <code className="text-xs text-zinc-500 block mt-2">
              /embed/episode/[id]
            </code>
          </div>

          <div className="pb-2">
            <h3 className="font-medium text-[#d43c4a]">Wide Episode Widget</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Široký widget pre jednu epizódu (horizontálny).
            </p>
            <code className="text-xs text-zinc-500 block mt-2">
              /embed/episode/[id]/wide
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}