import Link from "next/link";
import {
  Check,
  AlertCircle,
  MapPin,
  ArrowRight,
  Waves,
  Activity,
  Cake,
  Mountain,
  Snowflake,
  Bike,
  Wrench,
  Package,
  Trophy,
  Award,
  Users,
  Star,
} from "lucide-react";
import { pridobiCenikZaStran, pridobiCenikSekcijo } from "@/lib/vsebina";

type Props = {
  programSlug: string;
  ozadje?: string;
};

// Barvne teme kartic — celotna imena razredov morajo biti zapisana, da jih Tailwind najde.
const BARVE: Record<
  string,
  { kartica: string; rob: string; naslov: string; akcent: string; tekst: string }
> = {
  vijolicna: {
    kartica: "from-purple-50 to-purple-100",
    rob: "border-purple-200",
    naslov: "text-purple-900",
    akcent: "bg-purple-500 text-white",
    tekst: "text-purple-700",
  },
  oranzna: {
    kartica: "from-orange-50 to-orange-100",
    rob: "border-orange-200",
    naslov: "text-orange-900",
    akcent: "bg-brand-orange text-white",
    tekst: "text-orange-700",
  },
  modra: {
    kartica: "from-blue-50 to-blue-100",
    rob: "border-blue-200",
    naslov: "text-blue-900",
    akcent: "bg-blue-500 text-white",
    tekst: "text-blue-700",
  },
  cyan: {
    kartica: "from-cyan-50 to-blue-100",
    rob: "border-cyan-200",
    naslov: "text-cyan-900",
    akcent: "bg-cyan-500 text-white",
    tekst: "text-cyan-700",
  },
  zelena: {
    kartica: "from-green-50 to-emerald-100",
    rob: "border-green-200",
    naslov: "text-green-900",
    akcent: "bg-green-600 text-white",
    tekst: "text-green-700",
  },
  roza: {
    kartica: "from-pink-50 to-rose-100",
    rob: "border-pink-200",
    naslov: "text-pink-900",
    akcent: "bg-pink-500 text-white",
    tekst: "text-pink-700",
  },
  privzeta: {
    kartica: "from-orange-50 to-pink-50",
    rob: "border-orange-200",
    naslov: "text-orange-800",
    akcent: "bg-brand-orange text-white",
    tekst: "text-orange-800",
  },
};

const IKONE: Record<string, any> = {
  voda: Waves,
  sport: Activity,
  zoga: SoccerBall,
  torta: Cake,
  gora: Mountain,
  sneg: Snowflake,
  kolo: Bike,
  servis: Wrench,
  paket: Package,
  pokal: Trophy,
  medalja: Award,
  skupina: Users,
  zvezda: Star,
};

// Nogometna žoga — v naši verziji lucide-react je ni.
function SoccerBall({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7l4.76 3.45-1.82 5.6H9.06l-1.82-5.6z" />
      <path d="M12 7V2" />
      <path d="M7.24 10.45 2.49 8.91" />
      <path d="M9.06 16.05 6.12 20.1" />
      <path d="M14.94 16.05l2.94 4.05" />
      <path d="M16.76 10.45l4.75-1.54" />
    </svg>
  );
}

// Podpira **krepko** v opombi pod karticami.
function krepko(besedilo: string) {
  return besedilo.split(/\*\*(.+?)\*\*/g).map((del, i) =>
    i % 2 === 1 ? <strong key={i}>{del}</strong> : <span key={i}>{del}</span>
  );
}

// Sekcija "Cenik" — vsebino ureja CMS (/admin/cenik).
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
  const sirina = ena
    ? imaGlavo
      ? "max-w-2xl"
      : "max-w-md"
    : postavke.length === 2
    ? "max-w-3xl"
    : "max-w-6xl";
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
            const Ikona = p.ikona ? IKONE[p.ikona] : null;
            const velika = !!Ikona;
            const sredinsko = ena && !velika;

            return (
              <div
                key={p.id}
                className={`relative border-2 bg-gradient-to-br ${b.kartica} flex flex-col ${
                  velika
                    ? "rounded-3xl p-6 lg:p-7"
                    : sredinsko
                    ? "rounded-3xl p-8 lg:p-10 text-center"
                    : "rounded-2xl p-6 lg:p-7"
                } ${
                  p.poudarjen
                    ? "border-brand-orange ring-2 ring-brand-orange ring-offset-2"
                    : b.rob
                }`}
              >
                {p.poudarjen && p.znacka && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {p.znacka}
                  </span>
                )}
                {p.poudarjen && !p.znacka && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    NAJBOLJ PRILJUBLJENO
                  </span>
                )}

                {!p.poudarjen && p.znacka && (
                  <div
                    className={`inline-block bg-white ${b.naslov} text-xs font-bold px-3 py-1 rounded-full mb-4 ${
                      sredinsko ? "mx-auto" : "self-start"
                    }`}
                  >
                    {p.znacka}
                  </div>
                )}

                {Ikona && (
                  <div
                    className={`w-14 h-14 ${b.akcent} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    <Ikona size={26} />
                  </div>
                )}

                {sredinsko && !imaGlavo && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
                    Cenik
                  </h3>
                )}

                {sredinsko || velika ? (
                  <h3 className="text-2xl font-extrabold text-brand-navy leading-tight mb-1">
                    {p.naziv}
                  </h3>
                ) : (
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider mb-1 ${b.naslov}`}
                  >
                    {p.naziv}
                  </h3>
                )}

                {p.podnaslov && (
                  <p
                    className={`text-sm ${
                      velika ? `${b.tekst} font-semibold mb-5` : "text-slate-600 mb-4"
                    }`}
                  >
                    {p.podnaslov}
                  </p>
                )}

                {p.cena && (
                  <div className={sredinsko ? "mb-2" : "mb-5"}>
                    <span
                      className={`font-extrabold text-brand-navy ${
                        sredinsko ? "text-5xl" : "text-4xl"
                      }`}
                    >
                      {p.cena}
                    </span>
                    {p.enota && (
                      <span className="text-base text-slate-500">{p.enota}</span>
                    )}
                  </div>
                )}

                {p.opomba && (
                  <p className="text-xs text-slate-500 mb-6">{p.opomba}</p>
                )}

                {vrstice.length > 0 && (
                  <ul
                    className={`space-y-2.5 text-left text-sm ${
                      velika ? "mb-6 flex-1" : "mb-2"
                    } ${sredinsko ? "max-w-sm mx-auto w-full" : ""}`}
                  >
                    {vrstice.map((v, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check
                          size={16}
                          className={`shrink-0 mt-0.5 ${
                            velika ? b.tekst : "text-brand-orange"
                          }`}
                        />
                        <span className="text-slate-700">{v}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {p.lokacija && (
                  <div className="border-t border-slate-200 pt-4 text-xs text-slate-600 mb-4 text-left">
                    <strong className="block text-brand-navy mb-1">
                      <MapPin size={12} className="inline mr-1" /> Lokacija
                    </strong>
                    {p.lokacija}
                  </div>
                )}

                {p.gumb && p.gumb_povezava && (
                  <Link
                    href={p.gumb_povezava}
                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-navy hover:bg-brand-navy hover:text-white transition-colors px-5 py-3 rounded-xl font-bold text-sm border-2 border-brand-navy mt-auto"
                  >
                    {p.gumb} <ArrowRight size={14} />
                  </Link>
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
