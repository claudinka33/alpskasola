import { Check } from "lucide-react";
import { pridobiCenikZaStran } from "@/lib/vsebina";

type Props = {
  programSlug: string;
  ozadje?: string;
};

// Sekcija "Cenik" — vsebino ureja CMS (/admin/cenik).
// 1 postavka = ena kartica na sredini, več postavk = mreža.
export default async function CenikSekcija({
  programSlug,
  ozadje = "bg-white",
}: Props) {
  let postavke: Awaited<ReturnType<typeof pridobiCenikZaStran>> = [];
  try {
    postavke = await pridobiCenikZaStran(programSlug);
  } catch (e) {
    console.error("CenikSekcija:", e);
    return null;
  }

  if (postavke.length === 0) return null;

  const ena = postavke.length === 1;
  const sirina = ena ? "max-w-md" : postavke.length === 2 ? "max-w-3xl" : "max-w-6xl";
  const mreza = ena
    ? "grid-cols-1"
    : postavke.length === 2
    ? "grid-cols-1 sm:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`${ozadje} py-16 lg:py-20`}>
      <div className={`${sirina} mx-auto px-4 lg:px-8`}>
        <div className={`grid ${mreza} gap-5`}>
          {postavke.map((p) => {
            const vrstice = (p.vkljuceno || "")
              .split("\n")
              .map((v) => v.trim())
              .filter(Boolean);

            return (
              <div
                key={p.id}
                className={`relative rounded-3xl p-8 text-center bg-gradient-to-br from-orange-50 to-pink-50 border-2 ${
                  p.poudarjen ? "border-brand-orange shadow-xl shadow-brand-orange/10" : "border-orange-200"
                }`}
              >
                {p.poudarjen && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    NAJBOLJ PRILJUBLJENO
                  </span>
                )}

                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
                  Cenik
                </h3>
                <h2 className="text-2xl font-extrabold text-brand-navy mb-2">
                  {p.naziv}
                </h2>
                {p.podnaslov && (
                  <p className="text-sm text-slate-600 mb-6">{p.podnaslov}</p>
                )}

                <div className="mb-2">
                  <span className="text-5xl font-extrabold text-brand-navy">{p.cena}</span>
                  {p.enota && <span className="text-base text-slate-500">{p.enota}</span>}
                </div>
                {p.opomba && <p className="text-xs text-slate-500 mb-6">{p.opomba}</p>}

                {vrstice.length > 0 && (
                  <ul className="space-y-2 text-left text-sm">
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
      </div>
    </section>
  );
}
