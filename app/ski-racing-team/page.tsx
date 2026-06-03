import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Trophy, Target, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Tekmovalne ekipe | Alpska šola Rogla",
  description:
    "Tekmovalne ekipe Alpske šole (U6–U12) — resni treningi, državna in regijska tekmovanja. Za najbolj predane mlade smučarje.",
};

const lastnosti = [
  {
    icon: Target,
    title: "Resni treningi",
    text: "Strukturiran program, prilagojen tekmovalnemu nivoju.",
  },
  {
    icon: Trophy,
    title: "Tekmovanja",
    text: "Državna tekmovanja in Regijski pokal Vzhodne regije.",
  },
  {
    icon: Award,
    title: "Tekmovanja za mlajše člane",
    text: "Koroški pokal",
  },
  {
    icon: Users,
    title: "Strokovna trenerja",
    text: "Nejc Cilenšek in Claudia Seidl.",
  },
];

const tekmovanja = [
  { naziv: "Slovenski pokal", opis: "U12" },
  { naziv: "Pokal VZH regije", opis: "U10 in U12" },
  { naziv: "Koroški pokal", opis: "U6, U8 in U10" },
  { naziv: "Mini pokal Vitranc", opis: "U6, U8, U10 in U12" },
  { naziv: "Pokal Roka Petroviča", opis: "U10 in U12" },
];

export default function SkiRacingTeamPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Tekmovalno smučanje"
        title="Tekmovalne ekipe"
        subtitle="Za otroke in mladostnike, ki si želijo nadgraditi smučarsko kariero. Resni treningi, tekmovanja, ekipni duh."
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Trophy size={14} /> TEKMOVALNI PROGRAM
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Pot do tekmovalnega smučanja
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Tekmovalne ekipe <strong>U6, U8, U10 in U12</strong> Alpske šole so
              namenjene mladim smučarjem in smučarkam, ki si želijo svoje znanje
              nadgraditi in tekmovati na regijskem in državnem nivoju.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Pod vodstvom izkušenih trenerjev <strong>Nejca Cilenška in Claudio
              Seidl</strong> razvijamo tehniko, kondicijo in tekmovalno
              mentaliteto naših mladih tekmovalcev.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10 aspect-video">
            <img src="/tekmovalna_1.JPG" alt="Tekmovalne ekipe" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Lastnosti */}
      <section className="bg-blue-50/40 py-14 border-y border-blue-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lastnosti.map((l, i) => {
              const Icon = l.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-slate-200/70 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-orange mx-auto mb-3 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <strong className="block text-sm font-bold text-brand-navy mb-1">
                    {l.title}
                  </strong>
                  <span className="text-xs text-slate-600 leading-relaxed">
                    {l.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tekme */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-brand-navy mb-3">
              Kje tekmujemo
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Naši tekmovalci dosegajo odlične rezultate na različnih ravneh.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {tekmovanja.map((t, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6 text-center"
              >
                <Trophy size={28} className="text-brand-orange mx-auto mb-3" />
                <strong className="block text-base font-bold text-brand-navy mb-1">
                  {t.naziv}
                </strong>
                <span className="text-xs text-slate-600">{t.opis}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt vodje */}
      <section className="bg-blue-50/40 py-14 border-t border-blue-100">
        <div className="max-w-2xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-brand-navy mb-4">
            Za vse informacije
          </h2>
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70 inline-block">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-lg mx-auto mb-3">
              NC
            </div>
            <strong className="block text-base font-bold text-brand-navy">
              Nejc Cilenšek
            </strong>
            <span className="block text-xs text-slate-500 mb-3">
              Vodja tekmovalne smučarije
            </span>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <a
                href="tel:040702399"
                className="text-brand-orange hover:underline font-semibold"
              >
                📞 040 702 399
              </a>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <a
                href="mailto:nejc@alpskasola.com"
                className="text-brand-orange hover:underline font-semibold"
              >
                ✉ nejc@alpskasola.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <ProgramCta
        programSlug="ski-racing-team"
        title="Postani del ekipe"
        subtitle="Za vse podrobnosti in pogoje vstopa nas kontaktirajte."
      />
      <Footer />
    </main>
  );
}
