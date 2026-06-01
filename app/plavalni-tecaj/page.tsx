import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Check, Waves, MapPin, Calendar, Camera, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Tečaj plavanja | Alpska šola Rogla",
  description:
    "Plavalni tečaji v Termah Zreče in bazenu Slovenske Konjice. Za vse starosti — od začetnikov do plavalcev. 5 dni × 2 uri, izkušeni učitelji, karta vključena. 130€.",
};

const lokacije = [
  { ime: "Terme Zreče", opis: "Topla in prijetna voda" },
  { ime: "Bazen Slovenske Konjice", opis: "Domači bazen" },
];

const meseci = ["Maj", "Junij", "Julij", "Avgust"];

const faq = [
  {
    v: "Kaj potrebujejo otroci za na bazen?",
    o: "Kopalke in brisačo, lahko tudi kopalni plašč (priporočamo, da podpišete etikete). Potrebujejo še milo za tuširanje, stekleničko z vodo in vrečko za mokro brisačo. Dekleta naj imajo spete lase (čopi ali kita).",
  },
  {
    v: "Koliko otrok plava v skupini?",
    o: "Skupine se oblikujejo glede na znanje in starost otrok. Začetniške skupine so manjše — do 5 otrok na učitelja. Pri predšolskih otrocih tudi manj.",
  },
  {
    v: "Zakaj se otroci igrajo v 'čofotalniku'?",
    o: "Pri otrocih je pomembno sprejemanje športa na njim zanimiv način. Veliko dela poteka v nizkem bazenu, kjer se preko iger navajamo na novo okolje, potapljanje glave in škropljenje.",
  },
  {
    v: "Kaj pa hoja na stranišče?",
    o: "Pred plavanjem gre vedno cela skupina na stranišče. Med odmorom prav tako. Po potrebi otroka odpelje učitelj — sam ali z dogovorom z ostalimi učitelji.",
  },
  {
    v: "Kako je s preoblačenjem?",
    o: "Na začetku tečaja pomagamo otroke preobleči v kopalke. Po končanem tečaju jim pomagamo pri tuširanju in sušenju.",
  },
  {
    v: "Ali otrok v enem tednu splava?",
    o: "Otrokov napredek je individualen, odvisen od motorične dojemljivosti in starosti. Vsak otrok napreduje glede na svoje začetno stanje.",
  },
];

export default function PlavalniTecajPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Tečaj plavanja"
        title="Plavanje za vse starosti"
        subtitle="Dobrodošli v čarobnem svetu plavanja, kjer se otroci lahko potopijo v veselje vode in se naučijo plavati s pravim užitkom!"
        bgGradient="from-cyan-50 via-blue-50 to-white"
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy order-2 lg:order-1">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">otroci v bazenu</span>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Waves size={14} /> POLETNI PROGRAM
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Veščina za celo življenje
            </h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Verjamemo, da je plavanje ključna veščina, ki krepi otrokovo
              samozavest in spodbuja zdrav način življenja. Z veseljem vabimo
              vse male radovedneže, ki si želijo osvojiti vodne globine.
            </p>
            <p className="text-slate-600 leading-relaxed">
              S strokovno usposobljenimi in ljubečimi inštruktorji ustvarimo
              prijetno okolje, kjer se otroci sprostijo, zabavajo in pridobijo
              ključne veščine plavanja.
            </p>
          </div>
        </div>
      </section>

      {/* Kje in kdaj */}
      <section className="bg-blue-50/40 py-14 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70">
            <h3 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-4">
              <MapPin className="text-brand-orange" size={20} /> Kje plavamo
            </h3>
            <div className="space-y-3">
              {lokacije.map((l, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                    <Waves size={14} />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-brand-navy">
                      {l.ime}
                    </strong>
                    <span className="text-xs text-slate-600">{l.opis}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70">
            <h3 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-4">
              <Calendar className="text-brand-orange" size={20} /> Kdaj
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Plavalni tečaji potekajo v poletnih mesecih:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {meseci.map((m) => (
                <span
                  key={m}
                  className="bg-cyan-50 text-cyan-800 text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              <strong>Ponedeljek – Petek</strong>, 2 uri na dan.
            </p>
          </div>
        </div>
      </section>

      {/* Paket */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-2xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-brand-navy mb-2">
              Šola plavanja
            </h2>
            <p className="text-sm text-slate-600">10 šolskih ur — vse vključeno</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-200 rounded-3xl p-8 lg:p-10 text-center">
            <div className="inline-block bg-white text-cyan-800 text-xs font-bold px-3 py-1 rounded-full mb-4">
              💧 POLETNI HIT
            </div>
            <h3 className="text-2xl font-extrabold text-brand-navy mb-1">
              ŠOLA PLAVANJA
            </h3>
            <p className="text-sm text-slate-600 mb-6">10 šolskih ur (5×2)</p>
            <div className="text-5xl font-extrabold text-brand-navy mb-6">
              130€
            </div>
            <ul className="space-y-2.5 text-left max-w-sm mx-auto mb-6">
              {[
                "5× 2 uri tečaja (Pon – Pet)",
                "Izkušen učitelj plavanja / animator",
                "Spominska majica",
                "Diploma",
                "Karta za plavanje vključena v tečaj",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <span className="text-slate-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-brand-navy mb-2">
              Pogosta vprašanja
            </h2>
          </div>
          <div className="space-y-3">
            {faq.map((q, i) => (
              <details key={i} className="bg-white rounded-xl border border-slate-200/70 group">
                <summary className="px-5 py-4 cursor-pointer font-semibold text-brand-navy flex items-center justify-between hover:bg-slate-50 transition-colors">
                  {q.v}
                  <span className="text-brand-orange group-open:rotate-45 transition-transform text-xl">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                  {q.o}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ProgramCta
        programSlug="plavalni-tecaj"
        title="Prijava na plavalni tečaj"
        subtitle="Termini se hitro polnijo. Rezervirajte mesto."
      />
      <Footer />
    </main>
  );
}
