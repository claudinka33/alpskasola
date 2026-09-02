import { Check, AlertCircle } from "lucide-react";
import { pridobiCenikZaStran, pridobiCenikSekcijo } from "@/lib/vsebina";

type Props = {
  programSlug: string;
  ozadje?: string;
};

// Barvne teme kartic — celotna imena razredov morajo biti zapisana, da jih Tailwind najde.
const BARVE: Record<string, { kartica: string; naslov: string }> = {
  vijolicna: { kartica: "from-purple-50 to-purple-100 border-purple-200", naslov: "text-purple-900" },
  oranzna: { kartica: "from-orange-50 to-orange-100 border-orange-200", naslov: "text-orange-900" },
  modra: { kartica: "from-blue-50 to-blue-100 border-blue-200", naslov: "text-blue-900" },
  cyan: { kartica: "from-cyan-50 to-blue-100 border-cyan-200", naslov: "text-cyan-900" },
  zelena: { kartica: "from-green-50 to-emerald-100 border-green-200", naslov: "text-green-900" },
  roza: { kartica: "from-pink-50 to-rose-100 border-pink-200", naslov: "text-pink-900" },
  privzeta: { kartica: "from-orange-50 to-pink-50 border-orange-200", naslov: "text-orange-800" },
};

// Podpira **krepko** v opombi pod karticami.
function krepko(besedilo: string) {
  return besedilo.split(/\*\*(.+?)\*\*/g).map((del, i) =>
    i % 2 === 1 ? <strong key={i}>{del}</strong> : <span key={i}>{del}</span>
  );
}

// Sekcija "Cenik" — vsebino ureja CMS (/admin/cenik).
// 1 postavka = ena kartica na sredini, več postavk = mreža paketov.
export default async function CenikSekcija({
  programSlug,
  ozadje = "bg-white",
}: Props) {
  let postavke: Awaited<ReturnType<typeof pridobiCenikZaStran>> = [];
  let glava: Awaited<ReturnType<typeof pridobiCenikSekcijo>> = null;
  try {
    [postavke, glava] = await Promise.all([
      pridobiCenikZaStran(programSlug),
      pridobiCenikSekcijo(programSlug),
    ]);
  } catch (e) {
    console.error("CenikSekcija:", e);
    return null;
  }

  if (postavke.length === 0) return null;

  const ena = postavke.length === 1;
  const imaGlavo = !!(glava && (glava.badge || glava.naslov || glava.podnaslov));
  const sirina = ena ? "max-w-md" : postavke.length === 2 ? "max-w-3xl" : "max-w-6xl";
  const mreza = ena
    ? "grid-cols-1"
    : postavke.length === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`${ozadje} py-16 lg:py-20`}>
      <div className={`${sirina} mx-auto px-4 lg:px-8`}>
        {imaGlavo && (
          <div className="text-center mb-12">
            {glava?.badge && (
              <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
                <span className="w-6 h-px bg-brand-orange" />
                {glava.badge}
                <span className="w-6 h-px bg-brand-orange" />
              </div>
            )}
            {glava?.naslov && (
              <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight mb-2">
                {glava.naslov}
              </h2>
            )}
            {glava?.podnaslov && (
              <p className="text-sm text-slate-600">{glava.podnaslov}</p>
            )}
          </div>
        )}

        <div className={`grid ${mreza} gap-5`}>
          {postavke.map((p) => {
            const vrstice = (p.vkljuceno || "")
              .split("\n")
              .map((v) => v.trim())
              .filter(Boolean);
            const b = BARVE[p.barva || "privzeta"] || BARVE.privzeta;

            return (
              <div
                key={p.id}
                className={`relative border-2 bg-gradient-to-br ${b.kartica} ${
                  ena ? "rounded-3xl p-8 text-center" : "rounded-2xl p-6 lg:p-7"
                } ${
                  p.poudarjen
                    ? "border-brand-orange ring-2 ring-brand-orange ring-offset-2"
                    : ""
                }`}
              >
                {p.poudarjen && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {p.znacka || "NAJBOLJ PRILJUBLJENO"}
                  </span>
                )}

                {ena && !imaGlavo && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
                    Cenik
                  </h3>
                )}

                {ena ? (
                  <h2 className="text-2xl font-extrabold text-brand-navy mb-2">{p.naziv}</h2>
                ) : (
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${b.naslov}`}>
                    {p.naziv}
                  </h3>
                )}

                {p.podnaslov && (
                  <p className={`text-sm text-slate-600 ${ena ? "mb-6" : "mb-4"}`}>
                    {p.podnaslov}
                  </p>
                )}

                <div className={ena ? "mb-2" : "mb-5"}>
                  <span
                    className={`font-extrabold text-brand-navy ${
                      ena ? "text-5xl" : "text-4xl"
                    }`}
                  >
                    {p.cena}
                  </span>
                  {p.enota && <span className="text-base text-slate-500">{p.enota}</span>}
                </div>

                {p.opomba && <p className="text-xs text-slate-500 mb-6">{p.opomba}</p>}

                {vrstice.length > 0 && (
                  <ul className={`space-y-2 text-left text-sm ${ena ? "" : "mb-2"}`}>
                    {vrstice.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                        <span className="text-slate-700">{v}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {glava?.opomba_spodaj && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <span className="text-amber-900">{krepko(glava.opomba_spodaj)}</span>
          </div>
        )}
      </div>
    </section>
  );
}
