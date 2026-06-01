import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Mountain, Sun, Snowflake, TreeDeciduous, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Smučarska akademija | Alpska šola Rogla",
  description:
    "Celoletni program treningov za mlade smučarje. Zimski, spomladanski, jesenski in poletni del — vse za nadgradnjo znanja. Tabori na Rogli in v Baški.",
};

const obdobja = [
  {
    icon: TreeDeciduous,
    naslov: "Jesenski del",
    meseci: "September • Oktober • November",
    barva: "bg-amber-50 border-amber-200 text-amber-900",
    barvaIko: "bg-amber-200 text-amber-800",
    aktivnosti: [
      "Suhi treningi",
      "Plezanje",
      "Rolanje",
      "Akrobatika",
      "Plavanje",
      "Splošna priprava na zimsko sezono",
    ],
  },
  {
    icon: Snowflake,
    naslov: "Zimski del",
    meseci: "December • Januar • Februar • Marec",
    barva: "bg-blue-50 border-blue-200 text-blue-900",
    barvaIko: "bg-blue-200 text-blue-800",
    aktivnosti: [
      "Smučanje 25+ dni",
      "Smučanje na prosto",
      "Smučanje na količke",
      "Smučarske tekme",
    ],
  },
  {
    icon: Sun,
    naslov: "Spomladanski del",
    meseci: "April • Maj • Junij",
    barva: "bg-green-50 border-green-200 text-green-900",
    barvaIko: "bg-green-200 text-green-800",
    aktivnosti: [
      "Suhi treningi",
      "Plavanje",
      "Igre z žogo",
      "Pustolovski park",
      "Gardaland",
    ],
  },
  {
    icon: Mountain,
    naslov: "Športni tabori",
    meseci: "Junij na Rogli • Avgust v Baški",
    barva: "bg-orange-50 border-orange-200 text-orange-900",
    barvaIko: "bg-orange-200 text-orange-800",
    aktivnosti: [
      "Atletika",
      "Rolanje + Plavanje",
      "Akrobatika + Kolesarjenje",
      "Igre z žogo",
      "Pustolovski park",
    ],
  },
];

const zimskeAktivnosti = [
  "Osnovno vijuganje",
  "Vijuganje v širšem in ožjem hodniku",
  "Vožnja po celcu",
  "Grbine",
  "Snežni poligon",
  "Posamične vaje za pravilno tehniko",
  "Vožnja med količki",
  "Metodika učenja smučanja",
  "Pomoč pri učenju mlajših otrok",
];

const tekme = [
  "Mini pokal Vitranc",
  "Koroški pokal",
  "Little Fox",
];

export default function SmucarskaAkademijaPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Celoletni program"
        title="Smučarska akademija"
        subtitle="Akademija je celoletni program treningov za mlade smučarje, ki si želijo usvojiti čim več znanja na področju smučanja in učenja."
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy order-2 lg:order-1">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">akademija na Rogli</span>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              🏔️ CELOLETNI PROGRAM
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Za otroke, ki si želijo več
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              V program se lahko vključijo otroci, ki <strong>že imajo nekaj
              pridobljenega znanja</strong> in si tega želijo še nadgraditi, in
              otroci, ki ne želijo več tekmovati in bi svoje znanje usmerili v
              učenje smučanja.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Tekom leta imajo otroci 2–3× tedensko <strong>"suhe" treninge</strong>{" "}
              na prostem in v telovadnici. V mesecu juniju so organizirane
              enotedenske športne priprave na Rogli, v avgustu pa v Baški.
            </p>
          </div>
        </div>
      </section>

      {/* 4 obdobja */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              4 obdobja, 1 program
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              Kaj nas čaka skozi leto?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {obdobja.map((o, i) => {
              const Icon = o.icon;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border-2 p-6 ${o.barva}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${o.barvaIko} flex items-center justify-center shrink-0`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-brand-navy">
                        {o.naslov}
                      </h3>
                      <p className="text-xs text-slate-600">{o.meseci}</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {o.aktivnosti.map((a, j) => (
                      <li key={j} className="flex items-start gap-2 text-slate-700">
                        <span className="text-brand-orange font-bold mt-0.5">›</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zimske aktivnosti */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Zimske aktivnosti — kaj se učimo na Rogli
            </h2>
            <p className="text-sm text-slate-600 mb-5">
              V zimskih mesecih smučamo na Rogli, kjer se otroci spoznavajo s
              smučarsko tehniko:
            </p>
            <ul className="space-y-2">
              {zimskeAktivnosti.map((a, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-700"
                >
                  <Snowflake
                    size={14}
                    className="text-blue-600 shrink-0 mt-1"
                  />
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <strong className="block text-sm font-bold text-orange-900 mb-2">
                🏆 Smučarske tekme
              </strong>
              <div className="flex flex-wrap gap-2">
                {tekme.map((t, i) => (
                  <span
                    key={i}
                    className="bg-white text-orange-900 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="h-72 lg:h-auto rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">zimsko smučanje</span>
          </div>
        </div>
      </section>

      <ProgramCta
        programSlug="smucarska-akademija"
        title="Pridruži se akademiji"
        subtitle="Za vse podrobnosti in prijavo nas kontaktirajte."
      />
      <Footer />
    </main>
  );
}
