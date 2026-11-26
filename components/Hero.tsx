import Link from "next/link";
import { ArrowRight, Shield, Medal, Heart, Bus } from "lucide-react";
import Alpi, { AlpiOblacek } from "@/components/Alpi";

// Začetek domače strani: besedilo levo, kolaž pravih fotografij s tečajev desno.
// Fotografije zamenjaš tukaj (poti do slik v /public).
const kolaz = {
  velika: { src: "/mini-alpska-sola/23.jpg", alt: "Malčki Mini alpske šole mečejo sneg v zrak" },
  zgoraj: { src: "/tecaj-smucanja/08.jpg", alt: "Zaključek sezone z medaljami" },
  spodaj: { src: "/tecaj-bordanja/07.jpg", alt: "Alpska šola bordanja na Rogli" },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy">
      {/* Mehak sij v ozadju */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-orange/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-10 sm:px-6 md:pb-24 md:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:pb-28 lg:pt-16 2xl:max-w-[88rem]">
        {/* Besedilo */}
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse-orange rounded-full bg-brand-orange" />
            Prijave za zimo 2026/27 so odprte
          </div>

          <h1 className="mb-5 text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Migaj z nami,
            <br />
            <span className="text-brand-orange">zmaguj zase.</span>
          </h1>

          <p className="mb-7 max-w-lg text-base leading-relaxed text-white/85 lg:text-lg">
            Smučanje in bordanje na Rogli za otroke od 4. leta naprej — v majhnih skupinah
            in z izkušenimi učitelji. Začnemo v soboto, 9. 1. 2027.
          </p>

          {/* Hitra izbira zimskih programov */}
          <div className="mb-7 grid max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { href: "/mini-alpska-sola", naslov: "Mini alpska šola", leta: "4 – 6 let" },
              { href: "/sola-smucanja", naslov: "Alpska šola smučanja", leta: "od 6 let" },
              { href: "/tecaj-bordanja", naslov: "Alpska šola bordanja", leta: "od 6 let" },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-3.5 py-3 text-white transition hover:border-brand-orange/60 hover:bg-white/[0.12] sm:block"
              >
                <span className="block text-sm font-bold leading-tight">{p.naslov}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-white/60 group-hover:text-brand-orange">
                  {p.leta} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            <Link
              href="/prijava"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-7 py-4 text-sm font-bold text-white shadow-lg shadow-black/30 transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark"
            >
              Prijavi otroka <ArrowRight size={16} />
            </Link>
            <Link
              href="#programi"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Vsi programi
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Shield size={16} className="text-brand-orange" /> Varnost na prvem mestu
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Bus size={16} className="text-brand-orange" /> Avtobus iz Celja, Arclina, Frankolovega, Zreč (smučanje, bordanje)
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Medal size={16} className="text-brand-orange" /> 15+ let izkušenj
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-white/85">
              <Heart size={16} className="text-brand-orange" /> 15.000+ otrok
            </div>
          </div>
        </div>

        {/* Kolaž fotografij */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="grid h-[22rem] grid-cols-5 grid-rows-2 gap-3 sm:h-[28rem] lg:h-[34rem]">
            <div className="col-span-3 row-span-2 overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <img src={kolaz.velika.src} alt={kolaz.velika.alt} className="h-full w-full object-cover" />
            </div>
            <div className="col-span-2 overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <img src={kolaz.zgoraj.src} alt={kolaz.zgoraj.alt} className="h-full w-full object-cover" />
            </div>
            <div className="col-span-2 overflow-hidden rounded-3xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
              <img src={kolaz.spodaj.src} alt={kolaz.spodaj.alt} className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Plavajoča značka */}
          <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl sm:left-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-lg">⛷️</div>
            <div>
              <div className="text-sm font-extrabold leading-tight text-brand-navy">Sobote na Rogli</div>
              <div className="text-xs text-slate-500">Smučanje · bordanje · mini</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gorska silhueta na dnu */}
      {/* Alpi pozdravi obiskovalce */}
      <div className="pointer-events-none absolute bottom-2 right-2 z-20 flex items-end gap-1 sm:right-6 lg:right-[3%]">
        <AlpiOblacek rep="desno" className="mb-16 hidden sm:block lg:mb-24">
          Živjo, jaz sem Alpi! 👋
        </AlpiOblacek>
        <Alpi poza="maha" className="h-24 w-auto drop-shadow-xl sm:h-36 lg:h-48" alt="Alpi, maskota Alpske šole, pomaha" />
      </div>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 w-full lg:h-16"
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
