import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Cake, Gift, Users, Sparkles, Camera, PartyPopper } from "lucide-react";

export const metadata: Metadata = {
  title: "Rojstni dan z Alpsko šolo | Praznovanje | Alpska šola Rogla",
  description:
    "Praznujte rojstni dan z Alpsko šolo. Nepozaben dan na snegu ali bazenu, animatorji, igre, sladica. Za vašega otroka in njegove prijatelje.",
};

const ponudba = [
  {
    icon: Users,
    title: "Animatorji",
    text: "Naša izkušena ekipa poskrbi za zabavo.",
  },
  {
    icon: Sparkles,
    title: "Igre & aktivnosti",
    text: "Prilagojene starosti slavljenca.",
  },
  {
    icon: Cake,
    title: "Sladica & pijača",
    text: "Lahko se dogovorimo za torto in osvežitve.",
  },
  {
    icon: Gift,
    title: "Spominska darilca",
    text: "Vsak gost dobi majhno presenečenje.",
  },
];

export default function RojstniDanPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Praznujmo skupaj"
        title="Rojstni dan z Alpsko šolo"
        subtitle="Naredite slavljencu nepozaben dan. Praznovanje na snegu, ob bazenu ali v telovadnici — z animatorji, igrami in darilci."
        bgGradient="from-purple-50 via-pink-50 to-white"
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy order-2 lg:order-1">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">otroci praznujejo</span>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <PartyPopper size={14} /> NOV PROGRAM
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Nepozaben dan, ki ga ne bodo pozabili
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Naredite rojstni dan posebnega — naša ekipa poskrbi za <strong>vse organizacijske podrobnosti</strong>, da se vi lahko sprostite
              in uživate skupaj z otroki.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Prilagodimo se starosti slavljenca, številu povabljenih in
              željam. Možnosti so široke — od smučanja na Rogli, plavanja v
              termah, do telovadnice s športno abecedo.
            </p>
          </div>
        </div>
      </section>

      {/* Ponudba */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Kaj vključuje
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              Vsi sestavni deli zabave
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ponudba.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-slate-200/70 text-center hover:border-brand-orange/40 transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-pink-100 text-brand-orange mx-auto mb-4 flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <strong className="block text-sm font-bold text-brand-navy mb-1">
                    {p.title}
                  </strong>
                  <span className="text-xs text-slate-600 leading-relaxed">
                    {p.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="bg-white py-14 lg:py-16">
        <div className="max-w-2xl mx-auto px-4 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border-2 border-orange-200 rounded-3xl p-8">
            <Cake size={42} className="text-brand-orange mx-auto mb-3" />
            <h2 className="text-2xl font-extrabold text-brand-navy mb-2">
              Rezerviraj termin
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Pokličite ali pošljite prijavnico in dogovorili se bomo za
              podrobnosti.
            </p>
            <a
              href="tel:064230888"
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-brand-orange/30"
            >
              📞 Pokliči 064 230 888
            </a>
          </div>
        </div>
      </section>

      <ProgramCta
        programSlug="praznovanje-rojstnega-dne"
        title="Rezerviraj rojstni dan"
        subtitle="Izpolnite obrazec in v opombo zapišite datum + približno število otrok."
      />
      <Footer />
    </main>
  );
}
