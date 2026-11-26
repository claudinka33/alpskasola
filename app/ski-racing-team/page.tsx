import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import TerminiSekcija from "@/components/TerminiSekcija";
import CenikSekcija from "@/components/CenikSekcija";
import GalerijaSekcija from "@/components/GalerijaSekcija";
import { Trophy, Target, Users, Award } from "lucide-react";

// Cenik in termini se berejo iz baze (CMS) — stran se ne sme predpomniti.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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
        alpi="smuca"
        badge="Tekmovalno smučanje"
        title="Tekmovalne ekipe"
        subtitle="Za otroke in mladostnike, ki si želijo nadgraditi smučarsko kariero. Resni treningi, tekmovanja, ekipni duh."
      />

      {/* Uvod */}
      <section className="bg-white py-10 lg:py-16">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Trophy size={14} /> TEKMOVALNI PROGRAM
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy mb-4 leading-tight">
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
            <img src="/tekmovalci/14.jpg" alt="Tekmovalne ekipe" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Lastnosti */}
      <section className="bg-blue-50/40 py-14 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
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
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy mb-3">
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

      {/* Galerija fotografij — ureja se v CMS: /admin/galerija */}
      <GalerijaSekcija
        programSlug="ski-racing-team"
        samo="slike"
        fotoNaslov="Utrinki tekmovalne ekipe"
        fotoPodnaslov="Priprave na ledeniku, tekme, stopničke in ekipa, ki drži skupaj — tako je videti sezona z nami."
        privzeteSlike={[
      { url: "/tekmovalci/14.jpg", naslov: "Priprave na ledeniku", w: 1400, h: 1050, velika: true },
      { url: "/tekmovalci/22.jpg", naslov: "Med vratci", w: 1400, h: 933 },
      { url: "/tekmovalci/01.jpg", naslov: "Pozdrav z ledenika", w: 1050, h: 1400 },
      { url: "/tekmovalci/19.jpg", naslov: "Zmagovalna ekipa", w: 1400, h: 933, velika: true },
      { url: "/tekmovalci/05.jpg", naslov: "Na stopničkah", w: 787, h: 1400 },
      { url: "/tekmovalci/07.jpg", naslov: "Pred startom", w: 1050, h: 1400 },
      { url: "/tekmovalci/17.jpg", naslov: "Na vrhu z ekipo", w: 1400, h: 1050, velika: true },
      { url: "/tekmovalci/23.jpg", naslov: "Hitro skozi vratca", w: 1400, h: 933 },
      { url: "/tekmovalci/13.jpg", naslov: "Ena ekipa", w: 787, h: 1400 },
      { url: "/tekmovalci/30.jpg", naslov: "Pokal Vitranc", w: 1050, h: 1400 },
      { url: "/tekmovalci/18.jpg", naslov: "Saalbach, prizorišče SP 2025", w: 1400, h: 1050, velika: true },
      { url: "/tekmovalci/26.jpg", naslov: "Veleslalom", w: 1400, h: 933 },
      { url: "/tekmovalci/04.jpg", naslov: "S trenerko po tekmi", w: 1400, h: 933 },
      { url: "/tekmovalci/10.jpg", naslov: "Na poti na priprave", w: 1400, h: 1050, velika: true },
      { url: "/tekmovalci/25.jpg", naslov: "Polna koncentracija", w: 1400, h: 933 },
      { url: "/tekmovalci/15.jpg", naslov: "Nasmejani na ledeniku", w: 1050, h: 1400 },
      { url: "/tekmovalci/36.jpg", naslov: "Na startu", w: 1050, h: 1400 },
      { url: "/tekmovalci/03.jpg", naslov: "V coni za start", w: 1400, h: 933 },
      { url: "/tekmovalci/24.jpg", naslov: "Na tekmi", w: 1400, h: 933 },
      { url: "/tekmovalci/06.jpg", naslov: "Medalja in prijateljstvo", w: 1050, h: 1400 },
      { url: "/tekmovalci/34.jpg", naslov: "Ekipa pred startom", w: 1400, h: 1050 },
      { url: "/tekmovalci/28.jpg", naslov: "Obisk skakalnice", w: 1050, h: 1400 },
      { url: "/tekmovalci/02.jpg", naslov: "Pripravljena na slalom", w: 720, h: 960 },
      { url: "/tekmovalci/27.jpg", naslov: "V zavoju", w: 1400, h: 933 },
      { url: "/tekmovalci/08.jpg", naslov: "Pred startom na Argeta Junior", w: 1050, h: 1400 },
      { url: "/tekmovalci/12.jpg", naslov: "Trening na ledeniku", w: 1400, h: 1050 },
      { url: "/tekmovalci/33.jpg", naslov: "Druženje po treningu", w: 1400, h: 1050 },
      { url: "/tekmovalci/29.jpg", naslov: "Trening v Kranjski Gori", w: 1050, h: 1400 },
      { url: "/tekmovalci/31.jpg", naslov: "Najmlajša na tekmi", w: 1050, h: 1400 },
      { url: "/tekmovalci/09.jpg", naslov: "Ogled proge", w: 1050, h: 1400 },
      { url: "/tekmovalci/20.jpg", naslov: "Podelitev diplom", w: 1400, h: 933 },
      { url: "/tekmovalci/35.jpg", naslov: "Prva tekma", w: 1050, h: 1400 },
      { url: "/tekmovalci/16.jpg", naslov: "Skupaj na progi", w: 720, h: 960 },
      { url: "/tekmovalci/32.jpg", naslov: "Pokal Vitranc v Kranjski Gori", w: 1050, h: 1400 },
      { url: "/tekmovalci/11.jpg", naslov: "Ekipa na poti", w: 787, h: 1400 },
      { url: "/tekmovalci/37.jpg", naslov: "Čaka na start", w: 1050, h: 1400 },
      { url: "/tekmovalci/21.jpg", naslov: "Slalomista", w: 1050, h: 1400 },
      { url: "/tekmovalci/38.jpg", naslov: "Start z razgledom", w: 1050, h: 1400 },
        ]}
      />

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

      {/* Termini — ureja se v CMS: /admin/termini */}
      <TerminiSekcija
        programSlug="ski-racing-team"
        badge="Termini in tekme"
        naslov="Koledar"
      />

      {/* Cenik — ureja se v CMS: /admin/cenik */}
      <CenikSekcija programSlug="ski-racing-team" />

      <ProgramCta
        programSlug="ski-racing-team"
        title="Postani del ekipe"
        subtitle="Za vse podrobnosti in pogoje vstopa nas kontaktirajte."
      />
      <Footer />
    </main>
  );
}
