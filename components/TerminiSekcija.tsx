import { Calendar, MapPin } from "lucide-react";
import { pridobiTerminiZaStran } from "@/lib/vsebina";

type Props = {
  programSlug: string;
  badge?: string;
  naslov?: string;
  podnaslov?: string;
  ozadje?: string;
};

// Sekcija "Kje in kdaj" — vsebino ureja CMS (/admin/termini).
// Če za program ni nobenega termina z oznako "Prikaži na strani", se sekcija ne izriše.
export default async function TerminiSekcija({
  programSlug,
  badge = "Kje in kdaj",
  naslov = "Termini",
  podnaslov,
  ozadje = "bg-white",
}: Props) {
  let termini: Awaited<ReturnType<typeof pridobiTerminiZaStran>> = [];
  try {
    termini = await pridobiTerminiZaStran(programSlug);
  } catch (e) {
    console.error("TerminiSekcija:", e);
    return null;
  }

  if (termini.length === 0) return null;

  return (
    <section className={`${ozadje} py-16 lg:py-20`}>
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
            <span className="w-6 h-px bg-brand-orange" />
            {badge}
            <span className="w-6 h-px bg-brand-orange" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
            {naslov}
          </h2>
          {podnaslov && (
            <p className="text-sm text-slate-600 mt-3 max-w-2xl mx-auto">{podnaslov}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {termini.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl p-5 border border-slate-200/70 hover:border-brand-orange/40 transition-colors flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-brand-navy mb-0.5">
                  {t.naziv}
                </strong>
                {t.lokacija && (
                  <div className="text-xs text-slate-400 mb-0.5">{t.lokacija}</div>
                )}
                {t.dan && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} /> {t.dan}
                  </div>
                )}
                {(t.ura || t.skupina) && (
                  <div className="text-sm text-slate-700 mt-1">
                    {t.ura}
                    {t.ura && t.skupina ? " " : ""}
                    {t.skupina ? `(${t.skupina})` : ""}
                  </div>
                )}
                {t.status === "poln" && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    ZASEDENO
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
