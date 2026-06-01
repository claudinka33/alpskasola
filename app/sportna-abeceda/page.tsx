import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Check, Activity, Calendar, MapPin, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Športna abeceda | Alpska šola Rogla",
  description:
    "Gibalna vzgoja za predšolske otroke od 3 leta naprej in prvo triado. Vadba 1× tedensko v vrtcih: Vojnik, Zreče, Tepanje, Prevrat in Loče. Le 30€/mesec.",
};

const sporti = [
  "Tekalne igre",
  "Lovljenja",
  "Poligoni",
  "Igre z žogo",
  "Igre z loparji",
  "Gimnastika",
  "Ples",
  "Plezanje",
  "Atletika",
  "Borilni športi",
];

const termini = [
  {
    vrtec: "Vrtec Vojnik",
    dan: "Ponedeljek",
    cas: "14.15 – 15.00 (5/6 let)",
  },
  {
    vrtec: "Vrtec Vojnik",
    dan: "Ponedeljek",
    cas: "15.15 – 16.00 (3/4 let)",
  },
  {
    vrtec: "Vrtec Zreče",
    dan: "Torek",
    cas: "15.00 – 15.45",
  },
  {
    vrtec: "Vrtec Tepanje",
    dan: "Sreda",
    cas: "15.15 – 16.00",
  },
  {
    vrtec: "Vrtec Prevrat",
    dan: "Petek",
    cas: "15.15 – 16.00",
  },
  {
    vrtec: "Vrtec Loče",
    dan: "Petek",
    cas: "15.00 – 15.45",
  },
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
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">otroci na vadbi</span>
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
                className="bg-white rounded-xl p-3 border border-orange-100 text-center"
              >
                <span className="text-sm font-semibold text-brand-navy">{s}</span>
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

      {/* Termini */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Kje in kdaj
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              Termini po vrtcih
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {termini.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-slate-200/70 hover:border-brand-orange/40 transition-colors flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <strong className="block text-sm font-bold text-brand-navy mb-0.5">
                    {t.vrtec}
                  </strong>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar size={12} /> {t.dan}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">{t.cas}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Cenik */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-md mx-auto px-4 lg:px-8">
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-3xl p-8 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-800 mb-1">
              Cenik
            </h3>
            <h2 className="text-2xl font-extrabold text-brand-navy mb-2">
              Športna abeceda
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Za otroke od 3. leta naprej in prvo šolsko triado
            </p>
            <div className="mb-2">
              <span className="text-5xl font-extrabold text-brand-navy">30€</span>
              <span className="text-base text-slate-500">/mesec</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">Cena z DDV</p>
            <ul className="space-y-2 text-left text-sm">
              {[
                "Osnove gibanja, gimnastika, atletika",
                "Igre z žogo, borilni športi, ples",
                "Izkušen učitelj / animator",
                "Vadbeni kartonček + štampiljke",
                "Spominska majica + diploma",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <span className="text-slate-700">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProgramCta
        programSlug="sportna-abeceda"
        title="Prijava na športno abecedo"
        subtitle="Izberite vrtec in termin v prijavnem obrazcu."
      />
      <Footer />
    </main>
  );
}
