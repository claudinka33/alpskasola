import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export default function CtaBand() {
  return (
    <section className="relative bg-brand-navy text-white py-16 lg:py-20 overflow-hidden">
      {/* Mountain decoration */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0,200 L0,100 L120,40 L240,90 L360,30 L480,90 L600,50 L720,100 L800,80 L800,200 Z"
          fill="white"
        />
        <path
          d="M0,200 L0,150 L150,80 L300,140 L450,90 L600,150 L750,100 L800,140 L800,200 Z"
          fill="white"
          opacity="0.6"
        />
      </svg>

      <div className="relative max-w-3xl mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Pripravljen-a na{" "}
          <span className="text-brand-orange">novo sezono?</span>
        </h2>
        <p className="text-base lg:text-lg opacity-90 mb-8 max-w-xl mx-auto">
          Prijavi svojega otroka na tečaj smučanja, plavanja ali športno
          abecedo. Termini se hitro polnijo.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/prijava"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-brand-orange-dark transition-colors shadow-lg shadow-brand-orange/40"
          >
            Prijavi se zdaj <ArrowRight size={16} />
          </Link>
          <a
            href="tel:064230888"
            className="inline-flex items-center gap-2 bg-transparent text-white px-6 py-3.5 rounded-xl text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            <Phone size={16} /> Pokliči 064 230 888
          </a>
        </div>
      </div>
    </section>
  );
}
