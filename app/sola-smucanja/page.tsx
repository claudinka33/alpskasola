import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import SmucanjeTabs from "@/components/SmucanjeTabs";
import TerminiSekcija from "@/components/TerminiSekcija";
import CenikSekcija from "@/components/CenikSekcija";
import { Mountain, Snowflake, Bus, Utensils } from "lucide-react";

// Cenik in termini se berejo iz baze (CMS) — stran se ne sme predpomniti.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tečaji smučanja in bordanja | Alpska šola Rogla",
  description:
    "Tečaji smučanja in bordanja za vse stopnje. MINI Alpska šola (4-6 let), Šola smučanja (6+) in Šola bordanja (5+). Začnemo 10. januarja 2026.",
};

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

      {/* Trije zavihki: Alpska šola tečaj / Tečaj bordanja / Mini alpska šola */}
      <SmucanjeTabs />

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

      {/* Termini — ureja se v CMS: /admin/termini */}
      <TerminiSekcija
        programSlug="sola-smucanja"
        badge="Kje in kdaj"
        naslov="Termini"
      />

      {/* Cenik in paketi — ureja se v CMS: /admin/cenik */}
      <CenikSekcija programSlug="sola-smucanja" />

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
