import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Waves,
  Activity,
  Trophy,
  Cake,
  Users,
  Phone,
  Mail,
  Check,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Rojstni dan z Alpsko šolo | 3 paketi praznovanja",
  description:
    "Praznujte rojstni dan z Alpsko šolo. 3 paketi: Vodna zabava v Termah Zreče, Športna norišnica na prostem, Nogometna zabava. Za otroke 4-12 let.",
};

const paketi = [
  {
    id: "vodna",
    naslov: "Vodna zabava",
    podnaslov: "v Termah Zreče",
    icon: Waves,
    barva: "from-cyan-50 to-blue-100",
    border: "border-cyan-300",
    accent: "bg-cyan-500 text-white",
    textAccent: "text-cyan-700",
    bullets: [
      "Plavanje in zabavne igre z animatorji",
      "Posebna vodna animacija prilagojena starosti otrok",
      "Darilce za slavljenca",
      "Pogostitev (hrana in pijača)",
      "Vesela, topla in varna atmosfera v Termah Zreče",
    ],
    lokacija: "Terme Zreče — bazenski kompleks",
  },
  {
    id: "sportna",
    naslov: "Športna norišnica",
    podnaslov: "na prostem",
    icon: Activity,
    barva: "from-orange-50 to-amber-100",
    border: "border-orange-300",
    accent: "bg-brand-orange text-white",
    textAccent: "text-orange-700",
    bullets: [
      "Igre po izbiri otrok (med dvema ognjema, mini rokomet, poligon...)",
      "Animatorji vodijo zabavo od začetka do konca",
      "Darilce za slavljenca",
      "Pogostitev (hrana in pijača)",
      "Slavljenec sam izbere katere igre želi igrati",
    ],
    lokacija: "Zunanji prostori (po dogovoru)",
  },
  {
    id: "nogomet",
    naslov: "Nogometna zabava",
    podnaslov: "pravih prvakov",
    icon: Trophy,
    barva: "from-green-50 to-emerald-100",
    border: "border-green-300",
    accent: "bg-green-600 text-white",
    textAccent: "text-green-700",
    bullets: [
      "Pravi nogometni trening za otroke",
      "Mini turnir z medaljami za vse igralce",
      "Spretnostne vaje in goli",
      "Darilce za slavljenca",
      "Pogostitev po tekmi",
    ],
    lokacija: "Nogometno igrišče (po dogovoru)",
  },
];

const aktivnostiSportna = [
  "Med dvema ognjema", "Mini rokomet", "Poligon z ovirami", "Štafetne igre",
  "Metanje na tarčo", "Spretnostni izzivi", "Ravnotežne igre", "Igre z frizbijem",
  "Iskanje zaklada", "Ekipne misije", "Vleka vrvi", "Igra z vodnimi baloni",
];

export default function RojstniDanPage() {
  return (
    <main>
      <Navbar />

      {/* Hero banner s sliko */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <img
          src="/rojsnidan.png"
          alt="Rojstni dan z Alpsko šolo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 via-pink-900/40 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold mb-5">
              🎉 PRAZNUJMO SKUPAJ
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-4">
              Rojstni dan z Alpsko šolo
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-xl">
              3 različni paketi praznovanj — izberite tistega, ki bo slavljencu najbolj všeč.
            </p>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Info icon={Users} label="Starost" value="4–12 let" />
            <Info icon={Clock} label="Trajanje" value="2–3 ure" />
            <Info icon={Cake} label="3 paketi" value="Izbor je tvoj" />
          </div>
          <p className="text-center text-slate-600 leading-relaxed">
            Naredite rojstni dan posebnega — naša ekipa poskrbi za vse organizacijske
            podrobnosti, da se vi lahko sprostite in uživate.
          </p>
        </div>
      </section>

      {/* 3 paketi */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Izberite paket
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              3 nepozabne zabave
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {paketi.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  className={`bg-gradient-to-br ${p.barva} rounded-3xl border-2 ${p.border} p-6 lg:p-7 flex flex-col`}
                >
                  <div className={`w-14 h-14 ${p.accent} rounded-2xl flex items-center justify-center mb-4`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-brand-navy leading-tight mb-1">
                    {p.naslov}
                  </h3>
                  <p className={`text-sm ${p.textAccent} font-semibold mb-5`}>
                    {p.podnaslov}
                  </p>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {p.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check size={16} className={`shrink-0 mt-0.5 ${p.textAccent}`} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-slate-200 pt-4 text-xs text-slate-600 mb-4">
                    <strong className="block text-brand-navy mb-1">
                      <MapPin size={12} className="inline mr-1" /> Lokacija
                    </strong>
                    {p.lokacija}
                  </div>

                  <Link
                    href={`/prijava?program=praznovanje-rojstnega-dne&paket=${p.id}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-brand-navy hover:bg-brand-navy hover:text-white transition-colors px-5 py-3 rounded-xl font-bold text-sm border-2 border-brand-navy"
                  >
                    Rezerviraj termin <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Športna aktivnosti */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Activity size={14} /> Športna norišnica
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-3">
              Slavljenec izbira igre 🎯
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Pri športni norišnici slavljenec sam izbere katere aktivnosti
              želi imeti na svojem rojstnem dnevu:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {aktivnostiSportna.map((a) => (
              <div
                key={a}
                className="bg-orange-50/50 border border-orange-200 rounded-xl p-3 text-center text-sm font-medium text-brand-navy"
              >
                {a}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kontakt Zoja */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-t border-blue-100">
        <div className="max-w-2xl mx-auto px-4 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-3xl p-8">
            <div className="w-16 h-16 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
              ZP
            </div>
            <h2 className="text-xl font-extrabold text-brand-navy mb-1">
              Zoja Prosenak
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Vaša kontaktna oseba za rojstne dneve
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:031863739"
                className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/30"
              >
                <Phone size={16} /> 031 863 739
              </a>
              <a
                href="mailto:zoja@alpskasola.com"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-navy px-5 py-3 rounded-xl font-bold text-sm border-2 border-brand-navy/10"
              >
                <Mail size={16} /> zoja@alpskasola.com
              </a>
            </div>

            <p className="text-xs text-slate-500 mt-5">
              🎉 Rojstni dnevi se hitro polnijo — ne zamudite termina!
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/70 text-center">
      <Icon size={20} className="text-brand-orange mx-auto mb-2" />
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <strong className="text-sm text-brand-navy">{value}</strong>
    </div>
  );
}
