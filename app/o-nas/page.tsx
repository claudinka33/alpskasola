import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { Phone, Mail, MapPin, Clock, Camera } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "O nas | Alpska šola Rogla",
  description:
    "Alpska šola Rogla — največja šola smučanja v Sloveniji. Več kot 15 let izkušenj, 35+ licenciranih učiteljev, 10.000+ zaupanj. Spoznajte našo ekipo.",
};

const ekipa = [
  {
    ime: "Damjan Prosenak",
    vloga: "Vodja Alpske šole",
    email: "damjan@alpskasola.com",
    telefon: "064 230 888",
  },
  {
    ime: "Matej Vidmar",
    vloga: "Pomočnik vodje Alpske šole",
    email: "matej@alpskasola.com",
    telefon: "064 230 888",
  },
  {
    ime: "Aleška Brumec",
    vloga: "Vodja športne abecede",
    email: "aleska@alpskasola.com",
    telefon: "031 220 738",
  },
  {
    ime: "Nejc Cilenšek",
    vloga: "Vodja tekmovalne smučarije",
    email: "nejc@alpskasola.com",
    telefon: "040 702 399",
  },
];

const programi = [
  { naziv: "Tečaji smučanja in bordanja", opis: "Za vse starosti in znanja" },
  { naziv: "V skupini", opis: "Učenje + druženje" },
  { naziv: "Športna abeceda", opis: "Za otroke od 3 leta naprej" },
  { naziv: "Smučarska akademija", opis: "Celoletni program" },
  { naziv: "Servis in izposoja", opis: "Vse na enem mestu" },
];

export default function ONasPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Spoznajte nas"
        title="O Alpski šoli Rogla"
        subtitle="Dobrodošli na spletni strani Alpske šole Rogla — največje šole smučanja v Sloveniji."
      />

      {/* Glavna vsebina */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="prose-content space-y-5 text-base text-slate-700 leading-relaxed">
            <p>
              Z našo strastjo do smučanja in snežnih radosti smo postali vodilna
              šola smučanja v Sloveniji. S ponosom predstavljamo več kot{" "}
              <strong className="text-brand-navy">35 licenciranih učiteljev in trenerjev smučanja</strong>.
              Ne glede na vašo starost ali izkušnje, vam nudimo izjemno
              priložnost, da izpopolnite svoje smučarske spretnosti.
            </p>
            <p>
              Alpska šola.com je šola z dolgoletno tradicijo na področju učenja
              smučanja, boardanja in tekmovalnega smučanja in servisiranja
              smuči. V zadnjih letih smo aktivnosti razširili tudi izven belih
              poljan: Alpski šolarji z nami plavajo, rolajo, kolesarijo,
              planinarijo. V vrtcih in šolah pa smo znani predvsem po našem
              pestrem programu Športna abeceda.
            </p>
          </div>

          {/* Naši programi */}
          <div className="mt-12">
            <h2 className="text-2xl font-extrabold text-brand-navy mb-6">
              Naši programi
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {programi.map((p, i) => (
                <div
                  key={i}
                  className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="bg-brand-orange text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-brand-navy mb-0.5">
                      {p.naziv}
                    </strong>
                    <span className="text-xs text-slate-600">{p.opis}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skupinska slika */}
          <div className="mt-12 rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10">
            <img src="/skupinska.jpg" alt="Ekipa Alpske šole" className="w-full h-auto object-cover" />
          </div>
        </div>
      </section>

      {/* Ekipa */}
      <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Naša ekipa
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
              Vodje in kontakti
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {ekipa.map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200/70 hover:border-brand-orange/40 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-base shrink-0">
                    {c.ime
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy">{c.ime}</h3>
                    <p className="text-xs text-slate-500">{c.vloga}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm pt-3 border-t border-slate-100">
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-colors"
                  >
                    <Mail size={14} /> {c.email}
                  </a>
                  <a
                    href={`tel:${c.telefon.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-slate-600 hover:text-brand-orange transition-colors"
                  >
                    <Phone size={14} /> {c.telefon}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lokacija + delovni čas */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-navy mb-4 flex items-center gap-2">
              <MapPin className="text-brand-orange" size={24} /> Kje se nahajamo
            </h2>
            <div className="bg-blue-50/40 rounded-xl p-5 text-sm text-slate-700 space-y-1">
              <strong className="text-brand-navy block">Alpska šola.com</strong>
              <p>Tepanje 60</p>
              <p>3210 Slovenske Konjice</p>
              <p>Slovenija</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-navy mb-4 flex items-center gap-2">
              <Clock className="text-brand-orange" size={24} /> Delovni čas
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50/40 rounded-xl p-5">
                <strong className="text-brand-navy block mb-1 text-sm">
                  Uradne ure (telefon 064 230 888)
                </strong>
                <p className="text-sm text-slate-600">
                  Ponedeljek – Petek: 16h – 19h
                </p>
              </div>
              <div className="bg-blue-50/40 rounded-xl p-5">
                <strong className="text-brand-navy block mb-1 text-sm">
                  Ski servis
                </strong>
                <p className="text-sm text-slate-600">
                  Ponedeljek, Sreda, Petek: 16h – 20h
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
