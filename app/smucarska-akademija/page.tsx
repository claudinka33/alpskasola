import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import TerminiSekcija from "@/components/TerminiSekcija";
import CenikSekcija from "@/components/CenikSekcija";
import GalerijaSekcija from "@/components/GalerijaSekcija";
import {
  Mountain,
  Sun,
  Snowflake,
  TreeDeciduous,
  Activity,
  GraduationCap,
  Users,
  Trophy,
  Heart,
  Sparkles,
} from "lucide-react";

// Cenik in termini se berejo iz baze (CMS) — stran se ne sme predpomniti.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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

const stevilke = [
  { stevilka: "25+", opis: "smučarskih dni v sezoni" },
  { stevilka: "2–3×", opis: "tedensko treningi skozi leto" },
  { stevilka: "2", opis: "poletna tabora — Rogla in Baška" },
  { stevilka: "12", opis: "mesecev gibanja, ne le zima" },
];

const zakaj = [
  {
    icon: Activity,
    naslov: "Gibanje celo leto, ne samo pozimi",
    opis:
      "Ko sneg skopni, se ne ustavimo. Plezanje, rolanje, akrobatika, plavanje in igre z žogo zgradijo vsestransko gibalno podlago — tisto, ki otroku koristi pri smučanju in pri vsakem drugem športu.",
  },
  {
    icon: Snowflake,
    naslov: "Več kot 25 dni na snegu",
    opis:
      "Toliko smučanja, da napredek vidiš iz tedna v teden. Od čistega vijuganja do celca, grbin in količkov — otrok postane samozavesten smučar na vsakem terenu.",
  },
  {
    icon: Heart,
    naslov: "Smučanje brez pritiska",
    opis:
      "Akademija je za otroke, ki imajo smučanje radi, a ne želijo (ali ne želijo več) živeti tekmovalnega ritma. Tekme so priložnost za izziv in veselje, ne obveznost.",
  },
  {
    icon: GraduationCap,
    naslov: "Prvi koraki do učitelja smučanja",
    opis:
      "Otroci spoznajo metodiko učenja in pomagajo pri učenju mlajših. Tako svoje znanje razumejo globlje — in marsikdo odkrije, da bi nekoč rad učil tudi sam.",
  },
  {
    icon: Users,
    naslov: "Prijateljstva, ki trajajo",
    opis:
      "Ista skupina skozi vse leto, skupni treningi, tabori in izleti. Otroci se ne družijo le na smučišču — postanejo ekipa.",
  },
  {
    icon: Sparkles,
    naslov: "Doživetja, ki si jih zapomnijo",
    opis:
      "Teden priprav na Rogli, poletje v Baški, pustolovski park in Gardaland. Šport, ki je zabaven, je šport, ki ga otrok ne bo opustil.",
  },
];

const tekme = [
  "Mini pokal Vitranc",
  "Koroški pokal",
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
          {/* TODO: zamenjaj z novo fotografijo akademije, ko jo dobimo */}
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10 aspect-video order-2 lg:order-1">
            <img src="/akademija.jpeg" alt="Smučarska akademija" className="w-full h-full object-cover" />
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

      {/* Številke */}
      <section className="bg-brand-navy">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stevilke.map((s, i) => (
            <div key={i}>
              <div className="text-3xl lg:text-4xl font-extrabold text-brand-orange">{s.stevilka}</div>
              <div className="text-sm text-white/80 mt-1">{s.opis}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Galerija fotografij — ureja se v CMS: /admin/galerija */}
      <GalerijaSekcija
        programSlug="smucarska-akademija"
        samo="slike"
        fotoNaslov="Utrinki z akademije"
        fotoPodnaslov="Sneg, morje, kolo, rolanje, plezanje in prijatelji — tako je videti leto v akademiji."
        videoNaslov="Poglejte nas v akciji"
        videoPodnaslov="Priprave na Rogli, ledenik, morje in treningi — poglejte, kako je videti leto z nami."
        privzeteSlike={[
          { url: "/akademija-galerija/morje-pomol-skoki.jpg", naslov: "Skoki s pomola v Baški", w: 1360, h: 955, velika: true },
          { url: "/akademija-galerija/kolo-pumptrack.jpg", naslov: "Kolesarjenje po pumptracku na Rogli", w: 788, h: 1400 },
          { url: "/akademija-galerija/snezni-hrib.jpg", naslov: "Vsi skupaj na snežnem hribu", w: 1400, h: 1050 },
          { url: "/akademija-galerija/plezanje-1.jpg", naslov: "Plezanje", w: 1400, h: 1049 },
          { url: "/akademija-galerija/kosilo-spageti.jpg", naslov: "Zaslužena malica po smučanju", w: 1050, h: 1400 },
          { url: "/akademija-galerija/baska-soncni-zahod.jpg", naslov: "Sončni zahod v Baški", w: 1400, h: 1050, velika: true },
          { url: "/akademija-galerija/tekmovalci-smuci.jpg", naslov: "Zabava na snegu", w: 1400, h: 1050 },
          { url: "/akademija-galerija/kondicija-ovire.jpg", naslov: "Suhi trening na Rogli", w: 933, h: 1400 },
          { url: "/akademija-galerija/sedeznica.jpg", naslov: "Na sedežnici", w: 1400, h: 1050 },
          { url: "/akademija-galerija/rolanje-kolicki.jpg", naslov: "Rolanje med količki", w: 933, h: 1400 },
          { url: "/akademija-galerija/kolesarjenje-razgled.jpg", naslov: "Kolesarjenje z razgledom", w: 1400, h: 1050 },
          { url: "/akademija-galerija/skupinska-zakljucek.jpg", naslov: "Zaključek sezone", w: 1400, h: 934, velika: true },
          { url: "/akademija-galerija/baska-potapljanje.jpg", naslov: "Potapljanje v Baški", w: 1050, h: 1400 },
          { url: "/akademija-galerija/nasmeh-na-snegu.jpg", naslov: "Nasmeh po progi", w: 1400, h: 1050 },
          { url: "/akademija-galerija/kondicija-zoga.jpg", naslov: "Ravnotežje na žogi", w: 1400, h: 933 },
          { url: "/akademija-galerija/mali-smucar.jpg", naslov: "Prvi zavoji na Rogli", w: 1050, h: 1400 },
          { url: "/akademija-galerija/plezanje-2.jpg", naslov: "Plezalna stena", w: 1400, h: 1050 },
          { url: "/akademija-galerija/kolesarji-skupina.jpg", naslov: "Kolesarska ekipa", w: 1400, h: 1050, velika: true },
          { url: "/akademija-galerija/veleslalom.jpg", naslov: "Vožnja med količki", w: 1400, h: 934 },
          { url: "/akademija-galerija/rogla-skupina.jpg", naslov: "Skupina na Rogli", w: 1050, h: 1400 },
          { url: "/akademija-galerija/kino.jpg", naslov: "Izlet v kino", w: 1400, h: 1050 },
          { url: "/akademija-galerija/rolanje-pocitek.jpg", naslov: "Odmor med rolanjem", w: 1400, h: 1050 },
          { url: "/akademija-galerija/ucenje-s-trenerko.jpg", naslov: "Učenje s trenerko", w: 1050, h: 1400 },
          { url: "/akademija-galerija/kondicija-poligon.jpg", naslov: "Poligon na igrišču", w: 1400, h: 1050 },
          { url: "/akademija-galerija/najmlajsi-med-kolicki.jpg", naslov: "Najmlajši med količki", w: 1400, h: 934 },
          { url: "/akademija-galerija/kondicija-skok.jpg", naslov: "Skoki čez ovire", w: 1400, h: 1050 },
          { url: "/akademija-galerija/skupina-igrisce.jpg", naslov: "Poletne priprave na Rogli", w: 1400, h: 1050, velika: true },
        ]}
        privzetiVidei={[
          { id: "AFu2TUn5rMQ", naslov: "Alpska šola na morju" },
          { id: "jOtYv0mTmSc", naslov: "Priprave na Rogli" },
          { id: "SPlLGMQISgo", naslov: "Alpska šola na ledeniku" },
          { id: "JC6rVktcdFg", naslov: "Poletje na morju" },
          { id: "SpgGP4TOqpg", naslov: "Poletne priprave na Rogli" },
          { id: "m_utrd9Nuio", naslov: "Alpska šola na Debelem rtiču" },
          { id: "qstxy4jmWcQ", naslov: "Trening s tekmovalci Alpske šole" },
          { id: "ZCpIkWHGCGQ", naslov: "Alpska šola na morju" },
          { id: "8SNSmInIBfQ", naslov: "Alpska šola v Gardalandu" },
        ]}
      />

      {/* Zakaj akademija */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Zakaj akademija
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy mb-4">
              Več kot smučanje — celo leto športa in prijateljstva
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Tečaj traja teden dni, akademija traja celo leto. Prav zato otroci v
              njej napredujejo hitreje, ostanejo motivirani in šport vzamejo za
              svojega.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {zakaj.map((z, i) => {
              const Icon = z.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 hover:border-brand-orange/40 hover:shadow-lg hover:shadow-brand-navy/5 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2">{z.naslov}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{z.opis}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-orange to-orange-500 text-white p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <Trophy size={36} className="shrink-0" />
            <div className="flex-1">
              <strong className="block text-lg font-extrabold mb-1">Za starše: kaj otrok odnese?</strong>
              <p className="text-sm text-white/90 leading-relaxed">
                Boljšo tehniko in varnejše smučanje, močnejše telo, redno gibanje
                namesto zaslonov, samozavest in občutek pripadnosti ekipi. Vi pa
                vse leto veste, kje je vaš otrok — v gibanju, med prijatelji in v
                rokah izkušenih trenerjev.
              </p>
            </div>
            <a
              href="/prijava?program=smucarska-akademija"
              className="shrink-0 bg-white text-brand-orange font-bold px-5 py-3 rounded-xl text-sm hover:bg-orange-50 transition"
            >
              Prijavi otroka
            </a>
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
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10 aspect-video lg:aspect-auto">
            <img src="/zimskeaktivnosti.jpeg" alt="Zimske aktivnosti" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Videi — urejajo se v CMS: /admin/galerija */}
      <GalerijaSekcija
        programSlug="smucarska-akademija"
        samo="videi"
        fotoNaslov="Utrinki z akademije"
        fotoPodnaslov="Sneg, morje, kolo, rolanje, plezanje in prijatelji — tako je videti leto v akademiji."
        videoNaslov="Poglejte nas v akciji"
        videoPodnaslov="Priprave na Rogli, ledenik, morje in treningi — poglejte, kako je videti leto z nami."
        privzeteSlike={[
          { url: "/akademija-galerija/morje-pomol-skoki.jpg", naslov: "Skoki s pomola v Baški", w: 1360, h: 955, velika: true },
          { url: "/akademija-galerija/kolo-pumptrack.jpg", naslov: "Kolesarjenje po pumptracku na Rogli", w: 788, h: 1400 },
          { url: "/akademija-galerija/snezni-hrib.jpg", naslov: "Vsi skupaj na snežnem hribu", w: 1400, h: 1050 },
          { url: "/akademija-galerija/plezanje-1.jpg", naslov: "Plezanje", w: 1400, h: 1049 },
          { url: "/akademija-galerija/kosilo-spageti.jpg", naslov: "Zaslužena malica po smučanju", w: 1050, h: 1400 },
          { url: "/akademija-galerija/baska-soncni-zahod.jpg", naslov: "Sončni zahod v Baški", w: 1400, h: 1050, velika: true },
          { url: "/akademija-galerija/tekmovalci-smuci.jpg", naslov: "Zabava na snegu", w: 1400, h: 1050 },
          { url: "/akademija-galerija/kondicija-ovire.jpg", naslov: "Suhi trening na Rogli", w: 933, h: 1400 },
          { url: "/akademija-galerija/sedeznica.jpg", naslov: "Na sedežnici", w: 1400, h: 1050 },
          { url: "/akademija-galerija/rolanje-kolicki.jpg", naslov: "Rolanje med količki", w: 933, h: 1400 },
          { url: "/akademija-galerija/kolesarjenje-razgled.jpg", naslov: "Kolesarjenje z razgledom", w: 1400, h: 1050 },
          { url: "/akademija-galerija/skupinska-zakljucek.jpg", naslov: "Zaključek sezone", w: 1400, h: 934, velika: true },
          { url: "/akademija-galerija/baska-potapljanje.jpg", naslov: "Potapljanje v Baški", w: 1050, h: 1400 },
          { url: "/akademija-galerija/nasmeh-na-snegu.jpg", naslov: "Nasmeh po progi", w: 1400, h: 1050 },
          { url: "/akademija-galerija/kondicija-zoga.jpg", naslov: "Ravnotežje na žogi", w: 1400, h: 933 },
          { url: "/akademija-galerija/mali-smucar.jpg", naslov: "Prvi zavoji na Rogli", w: 1050, h: 1400 },
          { url: "/akademija-galerija/plezanje-2.jpg", naslov: "Plezalna stena", w: 1400, h: 1050 },
          { url: "/akademija-galerija/kolesarji-skupina.jpg", naslov: "Kolesarska ekipa", w: 1400, h: 1050, velika: true },
          { url: "/akademija-galerija/veleslalom.jpg", naslov: "Vožnja med količki", w: 1400, h: 934 },
          { url: "/akademija-galerija/rogla-skupina.jpg", naslov: "Skupina na Rogli", w: 1050, h: 1400 },
          { url: "/akademija-galerija/kino.jpg", naslov: "Izlet v kino", w: 1400, h: 1050 },
          { url: "/akademija-galerija/rolanje-pocitek.jpg", naslov: "Odmor med rolanjem", w: 1400, h: 1050 },
          { url: "/akademija-galerija/ucenje-s-trenerko.jpg", naslov: "Učenje s trenerko", w: 1050, h: 1400 },
          { url: "/akademija-galerija/kondicija-poligon.jpg", naslov: "Poligon na igrišču", w: 1400, h: 1050 },
          { url: "/akademija-galerija/najmlajsi-med-kolicki.jpg", naslov: "Najmlajši med količki", w: 1400, h: 934 },
          { url: "/akademija-galerija/kondicija-skok.jpg", naslov: "Skoki čez ovire", w: 1400, h: 1050 },
          { url: "/akademija-galerija/skupina-igrisce.jpg", naslov: "Poletne priprave na Rogli", w: 1400, h: 1050, velika: true },
        ]}
        privzetiVidei={[
          { id: "AFu2TUn5rMQ", naslov: "Alpska šola na morju" },
          { id: "jOtYv0mTmSc", naslov: "Priprave na Rogli" },
          { id: "SPlLGMQISgo", naslov: "Alpska šola na ledeniku" },
          { id: "JC6rVktcdFg", naslov: "Poletje na morju" },
          { id: "SpgGP4TOqpg", naslov: "Poletne priprave na Rogli" },
          { id: "m_utrd9Nuio", naslov: "Alpska šola na Debelem rtiču" },
          { id: "qstxy4jmWcQ", naslov: "Trening s tekmovalci Alpske šole" },
          { id: "ZCpIkWHGCGQ", naslov: "Alpska šola na morju" },
          { id: "8SNSmInIBfQ", naslov: "Alpska šola v Gardalandu" },
        ]}
      />

      {/* Termini — ureja se v CMS: /admin/termini */}
      <TerminiSekcija
        programSlug="smucarska-akademija"
        badge="Kje in kdaj"
        naslov="Termini"
      />

      {/* Cenik — ureja se v CMS: /admin/cenik */}
      <CenikSekcija programSlug="smucarska-akademija" />

      <ProgramCta
        programSlug="smucarska-akademija"
        title="Pridruži se akademiji"
        subtitle="Za vse podrobnosti in prijavo nas kontaktirajte."
      />
      <Footer />
    </main>
  );
}
