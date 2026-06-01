import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Package, Check, Camera, Mountain } from "lucide-react";

export const metadata: Metadata = {
  title: "Izposoja smučarske opreme | Alpska šola Rogla",
  description:
    "Izposoja kakovostne smučarske opreme za otroke in odrasle. Smuči, palice, čevlji, čelade — vse pripravljeno za varno smučanje.",
};

const oprema = [
  { naziv: "Smuči", opis: "Različne dolžine in zahtevnosti" },
  { naziv: "Smučarski čevlji", opis: "Po vseh velikostih" },
  { naziv: "Palice", opis: "Različne višine" },
  { naziv: "Čelade", opis: "Obvezna oprema za otroke" },
  { naziv: "Snežne deske", opis: "Za začetnike in napredne" },
  { naziv: "Snowboard čevlji", opis: "Vse velikosti" },
];

export default function IzposojaPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Izposoja"
        title="Izposoja smučarske opreme"
        subtitle="Kakovostna oprema za otroke in odrasle. Smuči, deska, čevlji, čelade — vse, kar potrebujete za varno smučanje."
        bgGradient="from-orange-50 via-amber-50 to-white"
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy order-2 lg:order-1">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">izposojevalnica</span>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Package size={14} /> KAKOVOSTNA OPREMA
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Brezskrbno smučanje brez stroškov nakupa
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Otroci hitro rastejo in oprema vsako leto ne ustreza več. Z
              izposojo pri nas se izognete <strong>stroškom nakupa nove
              opreme</strong> vsako sezono.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Vse smuči so redno servisirane, čevlji preverjeni, čelade
              brezhibne. Pripravljeni za varno in prijetno smučanje.
            </p>
          </div>
        </div>
      </section>

      {/* Oprema */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Kaj nudimo
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
              Celotna izposoja na enem mestu
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {oprema.map((o, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-slate-200/70 hover:border-brand-orange/40 transition-colors flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-brand-orange flex items-center justify-center shrink-0">
                  <Mountain size={16} />
                </div>
                <div>
                  <strong className="block text-sm font-bold text-brand-navy mb-0.5">
                    {o.naziv}
                  </strong>
                  <span className="text-xs text-slate-600">{o.opis}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zakaj izposoja */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-extrabold text-brand-navy mb-6 text-center">
            Zakaj izposoja pri nas?
          </h2>
          <div className="bg-white border border-slate-200/70 rounded-2xl p-6 lg:p-8">
            <ul className="space-y-3 text-sm text-slate-700">
              {[
                "Redno servisirana in nabrušena oprema",
                "Velika izbira velikosti za otroke",
                "Strokovno svetovanje pri izbiri",
                "Možnost izposoje za celotno sezono",
                "Možnost menjave med sezono, ko otrok zraste",
                "Ugodne cene za stalne stranke",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check
                    size={18}
                    className="text-brand-orange shrink-0 mt-0.5"
                  />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            Za točne cene in razpoložljivost pokličite 064 230 888.
          </p>
        </div>
      </section>

      <ProgramCta
        programSlug="izposoja-opreme"
        title="Rezerviraj opremo"
        subtitle="Pošljite prijavnico in se bomo dogovorili za prevzem."
      />
      <Footer />
    </main>
  );
}
