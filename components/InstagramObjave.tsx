import { Instagram } from "lucide-react";
import { pridobiInstagramObjave } from "@/lib/instagram";
import IgPloscica from "@/components/IgPloscica";

/* --------------------------------------------------------------
   Zadnje objave z Instagrama @alpskasola (domača stran).
   Če ni žetona (INSTAGRAM_TOKEN) ali objav, se sekcija ne pokaže.
   -------------------------------------------------------------- */
const PROFIL = "https://www.instagram.com/alpskasola/";

export default async function InstagramObjave() {
  const objave = await pridobiInstagramObjave(16);
  if (!objave.length) return null;

  return (
    <section id="instagram" className="border-y border-blue-100 bg-blue-50/40 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
              <span className="h-px w-6 bg-brand-orange" />
              Instagram · @alpskasola
            </div>
            <h2 className="mb-4 text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-navy lg:text-5xl">
              Utrinki z naših dogodkov
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600">
              Treningi, tekme, tečaji in nasmejani obrazi — sproti, kot se dogaja. Sledite nam, da ne zamudite ničesar.
            </p>
          </div>
          <a
            href={PROFIL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90 lg:self-auto"
          >
            <Instagram size={18} /> Sledite nam
          </a>
        </div>

        <div className="grid grid-cols-4 gap-2 lg:grid-cols-8 lg:gap-2.5">
          {objave.map((o) => (
            <IgPloscica key={o.id} o={o} />
          ))}
        </div>
      </div>
    </section>
  );
}
