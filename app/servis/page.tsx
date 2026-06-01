import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import { Wrench, Clock, MapPin, Camera, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Servis smuči | Alpska šola Rogla",
  description:
    "Profesionalen servis smuči in deske. Brušenje robov, voskanje, popravila. Tepanje 60 — Ponedeljek, Sreda, Petek od 16h do 20h.",
};

const storitve = [
  "Brušenje robov",
  "Voskanje s strojem",
  "Brušenje drsne ploskve",
  "Popravilo opraskanin",
  "Nastavitev vezi",
  "Polni servis (osnovni paket)",
  "Polni servis PRO",
  "Priprava deske / boarda",
];

const delovniCas = [
  { dan: "Ponedeljek", cas: "16h – 20h" },
  { dan: "Sreda", cas: "16h – 20h" },
  { dan: "Petek", cas: "16h – 20h" },
];

export default function ServisPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Servis"
        title="Servis smuči in desk"
        subtitle="Profesionalna priprava smuči in desk z izkušenimi serviserji. Vaša oprema bo pripravljena na vsako sezono."
        bgGradient="from-slate-50 via-gray-50 to-white"
      />

      {/* Uvod */}
      <section className="bg-white py-14 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Wrench size={14} /> 15+ LET IZKUŠENJ
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              Vaša smuči v najboljših rokah
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Naš servis vodi <strong>Matej Vidmar</strong>, pomočnik vodje
              Alpske šole. Z izkušnjami in profesionalno opremo poskrbi za
              vrhunsko pripravo vsakega para smuči ali deske.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Pravilno pripravljena oprema = <strong>varnejše smučanje, boljši
              občutek in dlje trajajoče smuči</strong>.
            </p>
          </div>
          <div className="h-72 lg:h-96 rounded-2xl bg-gradient-to-br from-slate-100 to-gray-200 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy">
            <Camera size={42} className="text-brand-orange" />
            <strong className="text-sm">Prostor za fotografijo</strong>
            <span className="text-xs text-slate-500">servis prostor</span>
          </div>
        </div>
      </section>

      {/* Storitve */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-brand-navy mb-2">
              Storitve servisa
            </h2>
            <p className="text-sm text-slate-600">
              Vse, kar potrebujete za vrhunsko pripravljen par smuči.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/70">
            <ul className="grid sm:grid-cols-2 gap-3">
              {storitve.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-slate-700"
                >
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
            Za točne cene pokličite — odvisno od obsega dela.
          </p>
        </div>
      </section>

      {/* Lokacija + čas */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70">
            <h3 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-4">
              <Clock className="text-brand-orange" size={20} /> Delovni čas
            </h3>
            <div className="space-y-2">
              {delovniCas.map((d, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
                >
                  <span className="text-sm font-semibold text-brand-navy">
                    {d.dan}
                  </span>
                  <span className="text-sm text-slate-600">{d.cas}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Izven delovnega časa nas pokličite za poseben dogovor.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200/70">
            <h3 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-4">
              <MapPin className="text-brand-orange" size={20} /> Kje smo
            </h3>
            <div className="space-y-1 text-sm text-slate-700">
              <strong className="block text-brand-navy">Alpska šola.com</strong>
              <p>Tepanje 60</p>
              <p>3210 Slovenske Konjice</p>
              <p>Slovenija</p>
            </div>
            <a
              href="tel:064230888"
              className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-4 py-2 rounded-lg text-sm font-semibold mt-4 hover:bg-orange-100 transition-colors"
            >
              📞 064 230 888
            </a>
          </div>
        </div>
      </section>

      <ProgramCta
        programSlug="servis"
        title="Naroči servis"
        subtitle="Pošljite prijavnico in vas bomo kontaktirali za podrobnosti."
      />
      <Footer />
    </main>
  );
}
