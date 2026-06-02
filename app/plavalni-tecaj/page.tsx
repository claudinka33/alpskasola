import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Waves, ArrowRight, MapPin, Clock, Users, Shield, Heart, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Plavalni tečaj — Alpska šola",
  description: "Tečaji plavanja v Termah Zreče. Za vse stopnje od začetnikov do izpopolnjevanja. Varno učenje z izkušenimi učitelji.",
};

export default function PlavalniTecajPage() {
  return (
    <main>
      <Navbar />

      {/* Hero banner s sliko */}
      <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
        <img
          src="/plavalni-tecaj.png"
          alt="Plavalni tečaj"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-900/40 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold mb-5">
              <span>★ POLETNI HIT 2026</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-4">
              Plavalni tečaj
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-xl">
              Učimo. Rastemo. Uživamo v vodi.
            </p>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-blue-50/60 py-8 border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard icon={MapPin} label="Lokacija" value="Terme Zreče" />
            <InfoCard icon={Users} label="Za otroke" value="3+ let" />
            <InfoCard icon={Clock} label="Trajanje" value="10 srečanj" />
            <InfoCard icon={Award} label="Učitelji" value="Strokovni" />
          </div>
        </div>
      </section>

      {/* Vsebina */}
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              O programu
              <span className="w-6 h-px bg-brand-orange" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy mb-4">
              Plavanje za vse stopnje
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Naši plavalni tečaji omogočajo otrokom varno in zabavno učenje plavanja v idealnih
              pogojih Term Zreče. Od prvih korakov v vodi do izpopolnjevanja tehnike.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <Feature
              icon={Shield}
              title="Varno učenje"
              text="Otrokova varnost je naša prioriteta. Vedno z izkušenimi učitelji."
            />
            <Feature
              icon={Heart}
              title="Zabavni pristop"
              text="Otroci se učijo skozi igro. Brez strahu, s pozitivno energijo."
            />
            <Feature
              icon={Users}
              title="Majhne skupine"
              text="Omejeno število otrok pomeni več individualne pozornosti."
            />
            <Feature
              icon={Award}
              title="Strokovne učitelji"
              text="Naši trenerji so izkušeni in pedagoško usposobljeni."
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 lg:p-8 text-center">
            <Waves size={36} className="text-blue-600 mx-auto mb-3" />
            <h3 className="text-2xl font-extrabold text-brand-navy mb-2">
              Pripravljen na vodne dogodivščine?
            </h3>
            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Prijavi se na plavalni tečaj — termini se hitro polnijo!
            </p>
            <Link
              href="/prijava?program=plavalni-tecaj"
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-orange/30 hover:bg-brand-orange-dark transition-colors"
            >
              Prijavi se na ta program <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/70 text-center">
      <Icon size={20} className="text-brand-orange mx-auto mb-2" />
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <strong className="text-sm text-brand-navy">{value}</strong>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5">
      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <h3 className="text-base font-bold text-brand-navy mb-1">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
