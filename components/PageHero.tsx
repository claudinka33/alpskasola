import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Alpi, { type AlpiPoza } from "@/components/Alpi";

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
  bgGradient?: string;
  alpi?: AlpiPoza | false;
}

export default function PageHero({
  badge,
  title,
  subtitle,
  bgGradient = "from-blue-50 via-blue-100/40 to-white",
  alpi = "maha",
}: PageHeroProps) {
  return (
    <section className={`relative bg-gradient-to-b ${bgGradient} pt-8 pb-12 md:pt-10 md:pb-14 lg:pt-12 lg:pb-16 overflow-hidden border-b border-blue-100`}>
      {/* Decorative mountains */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-30 pointer-events-none"
        viewBox="0 0 800 120"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0,120 L0,60 L120,20 L240,70 L360,30 L480,80 L600,40 L720,80 L800,50 L800,120 Z"
          fill="#4a6b8f"
          opacity="0.3"
        />
        <path
          d="M0,120 L0,90 L150,50 L300,90 L450,60 L600,90 L750,70 L800,100 L800,120 Z"
          fill="#2d4866"
          opacity="0.4"
        />
      </svg>

      {alpi && (
        <Alpi
          poza={alpi}
          className="absolute bottom-0 right-1 sm:right-6 lg:right-[7%] h-20 sm:h-32 lg:h-44 w-auto translate-y-[12%] drop-shadow-lg"
        />
      )}

      <div className="relative z-10 max-w-6xl 2xl:max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        {/* Breadcrumb */}
        <nav className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4 lg:mb-5">
          <Link href="/" className="hover:text-brand-orange transition-colors">
            Domov
          </Link>
          <ChevronRight size={12} />
          <span className="text-brand-navy font-medium">{title}</span>
        </nav>

        {badge && (
          <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
            <span className="w-6 h-px bg-brand-orange" />
            {badge}
            <span className="w-6 h-px bg-brand-orange" />
          </div>
        )}

        <h1 className="text-[2.1rem] sm:text-5xl lg:text-6xl font-extrabold break-words text-brand-navy tracking-tight leading-[1.05] mb-4">
          {title}
        </h1>

        {subtitle && (
          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
