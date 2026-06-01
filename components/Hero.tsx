import Link from "next/link";
import { ArrowRight, Play, Shield, Medal, Heart, Snowflake, Star, Mountain } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden mountain-bg">
      {/* Floating snowflakes */}
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

      {/* Clouds */}
      <svg
        className="absolute top-8 left-0 right-0 w-full opacity-50 pointer-events-none"
        viewBox="0 0 800 80"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="120" cy="40" rx="60" ry="14" fill="white" opacity="0.6" />
        <ellipse cx="180" cy="35" rx="50" ry="12" fill="white" opacity="0.7" />
        <ellipse cx="500" cy="50" rx="70" ry="15" fill="white" opacity="0.5" />
        <ellipse cx="560" cy="45" rx="55" ry="13" fill="white" opacity="0.6" />
        <ellipse cx="700" cy="30" rx="50" ry="11" fill="white" opacity="0.5" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-32 lg:pb-44">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-xs font-semibold text-brand-navy mb-6 border border-slate-200/60 shadow-sm">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse-orange" />
              Sezona 2025/26 — prijave so odprte
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
              Največja šola smučanja v Sloveniji. 15+ let izkušenj na belih
              strminah, 35+ usposobljenih učiteljev in 15.000+ otrok, ki so pri
              nas naredili prve smučarske korake.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/prijava"
                className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-brand-orange-dark transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Prijavi se na tečaj <ArrowRight size={16} />
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
                <Shield size={16} className="text-brand-orange" />
                <span>Varnost na prvem mestu</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Medal size={16} className="text-brand-orange" />
                <span>15+ let izkušenj</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Heart size={16} className="text-brand-orange" />
                <span>10.000+ zaupanj</span>
              </div>
            </div>
          </div>

          {/* Right visual - placeholder za sliko */}
          <div className="relative h-[400px] lg:h-[500px] hidden lg:block">
            {/* Main image placeholder */}
            <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-3 text-brand-navy">
              <Mountain size={48} className="text-brand-orange" />
              <strong className="text-sm font-semibold">
                Prostor za hero sliko
              </strong>
              <span className="text-xs text-slate-500 text-center px-6">
                Priporočamo panoramo Rogle ali otroke na smučišču
                <br />
                (vertikalno, ~600×750px)
              </span>
            </div>

            {/* Floating card 1 - Rogla */}
            <div className="absolute -left-8 top-16 bg-white p-3 rounded-2xl shadow-xl shadow-brand-navy/10 flex items-center gap-3 animate-float">
              <div className="bg-orange-50 text-brand-orange p-2 rounded-lg">
                <Snowflake size={22} />
              </div>
              <div>
                <strong className="block text-sm font-semibold text-brand-navy">
                  Rogla
                </strong>
                <span className="text-xs text-slate-500">
                  Naša domača piha
                </span>
              </div>
            </div>

            {/* Floating card 2 - Rating */}
            <div
              className="absolute -right-4 bottom-20 bg-white p-3 rounded-2xl shadow-xl shadow-brand-navy/10 flex items-center gap-3 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                <Star size={22} fill="currentColor" />
              </div>
              <div>
                <strong className="block text-sm font-semibold text-brand-navy">
                  4.9 / 5.0
                </strong>
                <span className="text-xs text-slate-500">
                  Ocena staršev
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mountains SVG at the bottom */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full pointer-events-none"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
        style={{ height: "200px" }}
      >
        <defs>
          <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a9fc4" />
            <stop offset="100%" stopColor="#a6c0db" />
          </linearGradient>
          <linearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4a6b8f" />
            <stop offset="100%" stopColor="#6b89aa" />
          </linearGradient>
          <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d4866" />
            <stop offset="100%" stopColor="#4a6b8f" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 L0,100 L80,40 L150,80 L220,30 L300,90 L380,50 L480,100 L560,40 L640,90 L720,60 L800,110 L800,200 Z"
          fill="url(#mtnBack)"
        />
        <path
          d="M0,200 L0,140 L70,90 L160,130 L240,70 L340,140 L440,90 L540,140 L620,100 L720,150 L800,120 L800,200 Z"
          fill="url(#mtnMid)"
        />
        <path
          d="M0,200 L0,170 L100,130 L200,160 L300,120 L400,170 L500,130 L600,170 L700,140 L800,180 L800,200 Z"
          fill="url(#mtnFront)"
        />
        {/* Snow caps */}
        <polygon
          points="80,40 65,55 75,55 70,70 90,70 85,55 95,55"
          fill="white"
          opacity="0.9"
        />
        <polygon
          points="220,30 205,48 215,48 210,65 230,65 225,48 235,48"
          fill="white"
          opacity="0.9"
        />
        <polygon
          points="380,50 365,67 375,67 370,82 390,82 385,67 395,67"
          fill="white"
          opacity="0.9"
        />
        <polygon
          points="560,40 545,58 555,58 550,73 570,73 565,58 575,58"
          fill="white"
          opacity="0.9"
        />
      </svg>
    </section>
  );
}
