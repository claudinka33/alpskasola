import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Check, Mountain, Snowflake, Bus, Utensils, Camera, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Tečaji smučanja in bordanja | Alpska šola Rogla",
  description:
    "Tečaji smučanja in bordanja za vse stopnje. MINI Alpska šola (4-6 let), Šola smučanja (6+) in Šola bordanja (5+). Začnemo 10. januarja 2026.",
};

const paketi = [
  {
    naslov: "MINI ŠOLA SMUČANJA",
    podnaslov: "Paket 6 sobot + zaključna prireditev",
    cena: "350€",
    barva: "from-purple-50 to-purple-100 border-purple-200",
    barvaTekst: "text-purple-900",
    features: [
      "Paket 6 sobot + zaključna prireditev",
      "Starost 4 – 6 let",
      "Pričnemo 10.1.2026",
      "Medalja in FIS brošura",
      "Smučamo soboto 9.30 – 13.00",
    ],
  },
  {
    naslov: "ŠOLA SMUČANJA",
    podnaslov: "Paket 8 sobot",
    cena: "480€",
    barva: "from-orange-50 to-orange-100 border-orange-200",
    barvaTekst: "text-orange-900",
    popular: true,
    features: [
      "8x tečaj od 9h – 15h",
      "8x organiziran prevoz iz Celja",
      "Kosilo s čajem v hotelu Planja",
      "Medalja + FIS brošura",
      "Začnemo 10.1.2026",
      "Cena karte 27,50€ (ni v paketu)",
    ],
  },
  {
    naslov: "ŠOLA BORDANJA",
    podnaslov: "Paket 8 sobot",
    cena: "480€",
    barva: "from-blue-50 to-blue-100 border-blue-200",
    barvaTekst: "text-blue-900",
    features: [
      "8x tečaj od 9h – 15h",
      "8x organiziran prevoz iz Celja",
      "Kosilo s čajem v hotelu Planja",
      "Medalja + FIS brošura",
      "Začnemo 10.1.2026",
      "Cena karte 27,50€ (ni v paketu)",
    ],
  },
];

const fakti = [
  {
    icon: Bus,
    title: "Organiziran prevoz",
    text: "Avtobus iz Celja in Zreč (po potrebi tudi drugi kraji).",
  },
  {
    icon: Utensils,
    title: "Kosilo vključeno",
    text: "Toplo kosilo s čajem v restavraciji hotela Planja.",
  },
  {
    icon: Mountain,
    title: "Po skupinah",
    text: "6 otrok na učitelja — glede na starost in znanje.",
  },
  {
    icon: Snowflake,
    title: "Vsa sezona",
    text: "8 sobot od 10.1.2026 naprej.",
  },
];

const vprasanja = [
  {
    v: "Zakaj smučamo od 9h – 15h?",
    o: "Želimo, da postanejo otroci samostojni smučarji in na začetku posvetimo nekaj časa tudi spoznavanju opreme. V času med kosilom se otroci spočijejo. V popoldanskem času se smučišče izprazni, čakalne vrste so krajše in proge samo za nas.",
  },
  {
    v: "Kaj potrebujejo otroci s sabo?",
    o: "Smuči, palice, smučarske čevlje, čelado, očala in smučarske rokavice. V nahrbtniku lahko imajo dodatne nogavice in prigrizek.",
  },
  {
    v: "Kje imajo otroci kosilo?",
    o: "Otroci dobijo kosilo v restavraciji hotela Planja. Hrana je raznolika. Alergije sporočite vnaprej — dogovorimo se s kuhinjo za poseben obrok.",
  },
  {
    v: "Ali otrok potrebuje smučarsko karto?",
    o: "Da, otrok potrebuje svojo karto. Pri nas jo lahko kupite po akcijski ceni 27,50€. Izjema so počitniški programi, kjer je karta vključena.",
  },
  {
    v: "Koliko otrok smuča v eni skupini?",
    o: "Skupine se oblikujejo glede na starost in predznanje. Z enim učiteljem smuča okoli 6 otrok.",
  },
  {
    v: "Kako je v primeru slabega vremena?",
    o: "Vsakodnevno spremljamo vreme in razmere. V primeru slabega vremena starše pravočasno obvestimo na spletni strani in osebno.",
  },
];

export default function SolaSmucanjaPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Zimski program"
        title="Tečaji smučanja in bordanja"
        subtitle="Otroci z izkušenimi učitelji spoznavajo osnove smučanja in bordanja na varen in igriv način. Po starosti in znanju razdeljeni v manjše skupine."
      />

      {/* Uvod + slika */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-orange-100 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-3">
              🎿 PRIČNEMO 10.1.2026
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Začnemo s spoznavanjem opreme, igrami na snegu in žičnico
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Začeli bomo s spoznavanjem in prilagajanjem na opremo, igrami na
              snegu, drsenjem po hribu, zavijanjem in uporabo žičnice. Tisti, ki
              so z osnovami že seznanjeni, se bodo učili pravilne smučarske
              tehnike — osnovno vijuganje, ritem smučanja, uporaba palic,
              smučanje v celcu in v snežnem parku.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Tečaji so narejeni glede na <strong>starost otroka</strong> in{" "}
              <strong>panogo</strong> (smučanje ali bordanje).
            </p>
          </div>
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">otroci na Rogli</span>
          </div>
        </div>
      </section>

      {/* Fakti */}
      <section className="bg-blue-50/40 py-14 border-y border-blue-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {fakti.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-slate-200/70 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-orange mx-auto mb-3 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <strong className="block text-sm font-bold text-brand-navy mb-1">
                    {f.title}
                  </strong>
                  <span className="text-xs text-slate-600">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Paketi */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Cenik
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight mb-2">
              Izberite svoj paket
            </h2>
            <p className="text-sm text-slate-600">
              Tri možnosti, prilagojene starosti in panogi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {paketi.map((p, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border-2 p-6 lg:p-7 bg-gradient-to-br ${p.barva} ${
                  p.popular ? "ring-2 ring-brand-orange ring-offset-2" : ""
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ NAJBOLJ POPULAREN
                  </span>
                )}
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${p.barvaTekst}`}>
                  {p.naslov}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{p.podnaslov}</p>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold text-brand-navy">
                    {p.cena}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check
                        size={16}
                        className="text-brand-orange shrink-0 mt-0.5"
                      />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <span className="text-amber-900">
              <strong>Dnevna smučarska karta</strong> na voljo po akcijski ceni{" "}
              <strong>27,50€</strong> (ni vštetо v paketu).
            </span>
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
            <p className="text-sm text-slate-600">
              Vse, kar morate vedeti pred prijavo.
            </p>
          </div>
          <div className="space-y-3">
            {vprasanja.map((q, i) => (
              <details
                key={i}
                className="bg-white rounded-xl border border-slate-200/70 group"
              >
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
        programSlug="sola-smucanja"
        title="Prijava na tečaj smučanja"
        subtitle="Mesta so omejena. Rezervirajte zdaj za sezono 2025/26."
      />
      <Footer />
    </main>
  );
}
