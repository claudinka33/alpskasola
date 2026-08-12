import Link from "next/link";
import { ArrowRight, Play, Shield, Medal, Heart } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      {/* Fotografija čez celo širino */}
      <div className="absolute inset-0">
        <img
          src="/skupinska.jpg"
          alt="Ekipa Alpske šole"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-32 lg:pt-28 lg:pb-44">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-white mb-6 border border-white/20">
            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse-orange" />
            ★ POLETNI HIT — Plavalni tečaj 2026
          </div>

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.02] tracking-tight mb-5">
            Migaj z nami,
            <br />
            <span className="text-brand-orange">zmaguj zase.</span>
          </h1>

          <p className="text-base lg:text-lg text-white/85 mb-8 max-w-lg leading-relaxed">
            Športno društvo z več kot 15 leti izkušenj. Smučanje, bordanje,
            plavanje, rolanje in športna abeceda — 35+ učiteljev in 15.000+
            otrok, ki so z nami vzljubili šport.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              href="/plavalni-tecaj"
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-7 py-4 rounded-xl text-sm font-bold hover:bg-brand-orange-dark transition-all shadow-lg shadow-black/30 hover:-translate-y-0.5"
            >
              Plavalni tečaji <ArrowRight size={16} />
            </Link>
            <Link
              href="/o-nas"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-4 rounded-xl text-sm font-semibold border border-white/25 hover:bg-white/20 transition-colors"
            >
              <Play size={16} /> Spoznaj nas
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Shield size={16} className="text-brand-orange" /> Varnost na prvem mestu
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Medal size={16} className="text-brand-orange" /> 15+ let izkušenj
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Heart size={16} className="text-brand-orange" /> 10.000+ zaupanj staršev
            </div>
          </div>
        </div>
      </div>

      {/* Gorska silhueta na dnu */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-16 lg:h-24 pointer-events-none"
        viewBox="0 0 800 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 L0,50 L80,20 L150,45 L220,12 L300,48 L380,22 L480,52 L560,18 L640,48 L720,26 L800,55 L800,80 Z"
          fill="white"
          opacity="0.12"
        />
        <path
          d="M0,80 L0,66 L100,44 L200,62 L300,40 L400,66 L500,44 L600,66 L700,48 L800,70 L800,80 Z"
          fill="white"
        />
      </svg>
    </section>
  );
}
