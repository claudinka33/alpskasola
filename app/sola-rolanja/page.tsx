import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Check, Camera, Bike, Sun } from "lucide-react";

export const metadata: Metadata = {
  title: "Tečaj rolanja | Alpska šola Rogla",
  description:
    "Tečaj rolanja v spomladanskih in poletnih mesecih. Učenje varne tehnike, ravnotežja in zabave na kolesih za otroke.",
};

const fakti = [
  {
    icon: Sun,
    title: "Pomlad & poletje",
    text: "Tečaji potekajo izven smučarske sezone.",
  },
  {
    icon: Bike,
    title: "Varna oprema",
    text: "Čelada in ščitniki obvezni.",
  },
  {
    icon: Check,
    title: "Po stopnjah",
    text: "Skupine glede na predznanje.",
  },
];

export default function SolaRolanjaPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Spomladanski / poletni program"
        title="Tečaj rolanja"
        subtitle="Ko se sneg umakne, se gibanje nadaljuje na kolesih. Učimo varno tehniko, ravnotežje in uživanje v rolanju."
        bgGradient="from-green-50 via-emerald-50 to-white"
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Bike size={14} /> ZA OSTANE V GIBANJU CELO LETO
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Rolanje — naravno nadaljevanje smučanja
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Rolanje je odlična aktivnost, ki <strong>razvija ravnotežje,
              koordinacijo</strong> in moč nog — vse, kar potrebuje smučar.
              Otroci v sproščenem vzdušju pridobijo samozavest na kolesih in se
              naučijo varne tehnike.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Tečaji potekajo v <strong>spomladanskih in poletnih mesecih</strong>,
              ko vreme dovoli. Učenje poteka na varnih asfaltnih površinah.
            </p>
          </div>
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">otroci na rolerjih</span>
          </div>
        </div>
      </section>

      {/* Fakti */}
      <section className="bg-blue-50/40 py-14 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {fakti.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 border border-slate-200/70 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 mx-auto mb-3 flex items-center justify-center">
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

      {/* Kaj potrebujejo */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <h2 className="text-2xl font-extrabold text-brand-navy mb-6 text-center">
            Kaj potrebujejo otroci?
          </h2>
          <div className="bg-white border border-slate-200/70 rounded-2xl p-6">
            <ul className="space-y-2.5 text-sm text-slate-700">
              {[
                "Rolerji (lastni ali izposojeni)",
                "Zaščitna čelada — OBVEZNA",
                "Ščitniki za zapestja, komolce in kolena",
                "Udobna športna oblačila",
                "Steklenička z vodo",
                "Sončna krema (za poletne dni)",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">
            Za točne termine in cene nas kontaktirajte na 064 230 888.
          </p>
        </div>
      </section>

      <ProgramCta
        programSlug="sola-rolanja"
        title="Prijava na tečaj rolanja"
        subtitle="Pokličite za točne termine in razpoložljiva mesta."
      />
      <Footer />
    </main>
  );
}
