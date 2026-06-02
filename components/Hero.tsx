import Link from "next/link";
import { ArrowRight, Play, Shield, Medal, Heart, Waves, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden mountain-bg pb-32 lg:pb-40">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/60 animate-snow-fall"
            style={{
              left: `${(i * 7) % 100}%`,
              fontSize: `${10 + (i % 3) * 4}px`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + (i % 4) * 2}s`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <svg className="absolute top-8 left-0 right-0 w-full opacity-50 pointer-events-none" viewBox="0 0 800 80" preserveAspectRatio="xMidYMid slice">
        <ellipse cx="120" cy="40" rx="60" ry="14" fill="white" opacity="0.6" />
        <ellipse cx="500" cy="50" rx="70" ry="15" fill="white" opacity="0.5" />
        <ellipse cx="700" cy="30" rx="50" ry="11" fill="white" opacity="0.5" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-xs font-semibold text-brand-navy mb-6 border border-slate-200/60 shadow-sm">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse-orange" />
              ★ POLETNI HIT — Plavalni tečaj 2026
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-brand-navy leading-[1] tracking-tight mb-5">
              Migaj z nami,
              <br />
              <span className="relative inline-block text-brand-orange">
                zmaguj zase.
                <span className="absolute left-0 right-0 bottom-1 h-2 bg-brand-orange/20 -z-10" />
              </span>
            </h1>

            <p className="text-base lg:text-lg text-slate-600 mb-7 max-w-lg leading-relaxed">
              Največja šola smučanja v Sloveniji. 15+ let izkušenj, 35+ usposobljenih
              učiteljev in 15.000+ otrok. Poleti pa plavanje za vse stopnje.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/plavalni-tecaj"
                className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-0.5"
              >
                Plavalni tečaji <ArrowRight size={16} />
              </Link>
              <Link
                href="/o-nas"
                className="inline-flex items-center gap-2 bg-white text-brand-navy px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <Play size={16} /> Spoznaj nas
              </Link>
            </div>

            <div className="flex flex-wrap gap-5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Shield size={16} className="text-brand-orange" /> <span>Varnost na prvem mestu</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Medal size={16} className="text-brand-orange" /> <span>15+ let izkušenj</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Heart size={16} className="text-brand-orange" /> <span>10.000+ zaupanj</span>
              </div>
            </div>
          </div>

          {/* Slika - zdaj zadaj za gorami */}
          <div className="relative z-0 lg:-mt-8">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/20">
              <img
                src="/plavalni-tecaj.png"
                alt="Plavalni tečaj"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="hidden lg:flex absolute -left-6 -top-4 bg-white p-3 rounded-2xl shadow-xl shadow-brand-navy/10 items-center gap-3 animate-float">
              <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                <Waves size={22} />
              </div>
              <div>
                <strong className="block text-sm font-semibold text-brand-navy">
                  Plavalni tečaj
                </strong>
                <span className="text-xs text-slate-500">Poletna ponudba</span>
              </div>
            </div>

            <div className="hidden lg:flex absolute -right-2 -bottom-6 bg-white p-3 rounded-2xl shadow-xl shadow-brand-navy/10 items-center gap-3 animate-float" style={{ animationDelay: "1.5s" }}>
              <div className="bg-amber-50 text-amber-700 p-2 rounded-lg">
                <Star size={22} fill="currentColor" />
              </div>
              <div>
                <strong className="block text-sm font-semibold text-brand-navy">4.9 / 5.0</strong>
                <span className="text-xs text-slate-500">Ocena staršev</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none z-20" viewBox="0 0 800 120" preserveAspectRatio="xMidYMax slice" style={{ height: "200px" }}>
        <defs>
          <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7a9fc4" /><stop offset="100%" stopColor="#a6c0db" /></linearGradient>
          <linearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4a6b8f" /><stop offset="100%" stopColor="#6b89aa" /></linearGradient>
          <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2d4866" /><stop offset="100%" stopColor="#4a6b8f" /></linearGradient>
        </defs>
        <path d="M0,120 L0,60 L80,20 L150,50 L220,15 L300,55 L380,25 L480,60 L560,20 L640,55 L720,30 L800,65 L800,120 Z" fill="url(#mtnBack)" />
        <path d="M0,120 L0,80 L70,50 L160,75 L240,40 L340,80 L440,50 L540,80 L620,55 L720,85 L800,65 L800,120 Z" fill="url(#mtnMid)" />
        <path d="M0,120 L0,100 L100,75 L200,95 L300,70 L400,100 L500,75 L600,100 L700,80 L800,105 L800,120 Z" fill="url(#mtnFront)" />
        <polygon points="80,20 67,33 76,33 71,46 89,46 84,33 93,33" fill="white" opacity="0.9" />
        <polygon points="220,15 207,30 217,30 212,44 232,44 227,30 237,30" fill="white" opacity="0.9" />
        <polygon points="380,25 367,40 377,40 372,53 392,53 387,40 397,40" fill="white" opacity="0.9" />
        <polygon points="560,20 547,35 557,35 552,48 572,48 567,35 577,35" fill="white" opacity="0.9" />
      </svg>
    </section>
  );
}
