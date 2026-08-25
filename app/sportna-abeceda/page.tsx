import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import TerminiSekcija from "@/components/TerminiSekcija";
import CenikSekcija from "@/components/CenikSekcija";
import { Check, Activity } from "lucide-react";

// Termini in cenik se berejo iz baze (CMS) — stran se ne sme predpomniti.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Športna abeceda | Alpska šola Rogla",
  description:
    "Gibalna vzgoja za predšolske otroke od 3 leta naprej in prvo triado. Vadba 1× tedensko v vrtcih: Vojnik, Zreče, Tepanje, Prevrat in Loče. Le 30€/mesec.",
};

const sporti = [
  { ime: "Tekalne igre", ikona: "🏃", barva: "bg-red-50 border-red-200" },
  { ime: "Lovljenja", ikona: "🤾", barva: "bg-amber-50 border-amber-200" },
  { ime: "Poligoni", ikona: "🚧", barva: "bg-yellow-50 border-yellow-200" },
  { ime: "Igre z žogo", ikona: "⚽", barva: "bg-green-50 border-green-200" },
  { ime: "Igre z loparji", ikona: "🏸", barva: "bg-emerald-50 border-emerald-200" },
  { ime: "Gimnastika", ikona: "🤸", barva: "bg-cyan-50 border-cyan-200" },
  { ime: "Ples", ikona: "💃", barva: "bg-pink-50 border-pink-200" },
  { ime: "Plezanje", ikona: "🧗", barva: "bg-blue-50 border-blue-200" },
  { ime: "Atletika", ikona: "🏅", barva: "bg-orange-50 border-orange-200" },
  { ime: "Borilni športi", ikona: "🥋", barva: "bg-purple-50 border-purple-200" },
];


export default function SportnaAbecedaPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Vrtec & 1. triada"
        title="Športna abeceda"
        subtitle="Vadba, ki temelji na razvoju osnovnih motoričnih sposobnosti in gibalnih spretnosti — prilagojena starostnim stopnjam in predznanju."
        bgGradient="from-pink-50 via-orange-50 to-white"
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Activity size={14} /> OD 3 LETA NAPREJ
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Šport skozi igro — 1× tedensko
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              K vadbi se lahko vpišejo predšolski otroci od 3. leta naprej in
              šolski otroci prve triade. Telovadimo <strong>1× tedensko eno šolsko uro</strong>.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Otroci dobijo <strong>vadbeni kartonček</strong>, v katerega
              prejmejo za vsako osvojeno panogo novo štampiljko! 🎉
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10 aspect-video">
            <img src="/abeceda.JPG" alt="Športna abeceda" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Kaj delamo */}
      <section className="bg-orange-50/40 py-14 border-y border-orange-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-brand-navy mb-2">
              Kaj počnemo na vadbi?
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Naš cilj je otrokom približati šport v igrivem vzdušju, vzpostaviti
              zdravo mero tekmovalnosti in razvijati občutek zadovoljstva ob
              obvladovanju telesa.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sporti.map((s, i) => (
              <div
                key={i}
                className={`rounded-xl p-3 border text-center ${s.barva}`}
              >
                <span className="block text-2xl mb-1" aria-hidden="true">
                  {s.ikona}
                </span>
                <span className="text-sm font-semibold text-brand-navy">{s.ime}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200/70">
            <h3 className="font-bold text-brand-navy mb-2">Zakaj vpisati otroka?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pri tej starosti morajo otroci spoznati <strong>motorično širino</strong>{" "}
              in poskusiti najrazličnejše športe — njihova dojemljivost in
              sprejemanje vplivov okolja je največja. Otrok razvija socialno
              plat, sodelovanje in sprejemanje drugih ter dokazovanje sebe v
              družbi.
            </p>
          </div>
        </div>
      </section>

      {/* Termini — ureja se v CMS: /admin/termini */}
      <TerminiSekcija
        programSlug="sportna-abeceda"
        badge="Kje in kdaj"
        naslov="Termini po vrtcih"
      />

      {/* Oprema */}
      <section className="bg-blue-50/40 py-14 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-extrabold text-brand-navy mb-4 text-center">
            Kaj potrebujejo otroci?
          </h2>
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70">
            <ul className="space-y-2 text-sm text-slate-700">
              {[
                "Udobna športna oblačila (trenirka, pajkice, kratke hlače, kratka majica)",
                "Športna obutev (copati z nedrsečim podplatom ali superge)",
                "Gumica za dolge lase",
                "Steklenička z vodo",
                "V vrtcu lahko telovadijo v copatih, ki jih nosijo v vrtcu",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cenik — ureja se v CMS: /admin/cenik */}
      <CenikSekcija programSlug="sportna-abeceda" />

      <ProgramCta
        programSlug="sportna-abeceda"
        title="Prijava na športno abecedo"
        subtitle="Izberite vrtec in termin v prijavnem obrazcu."
      />
      <Footer />
    </main>
  );
}
