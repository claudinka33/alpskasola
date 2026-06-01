import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

interface ProgramCtaProps {
  programSlug: string;
  title?: string;
  subtitle?: string;
}

export default function ProgramCta({
  programSlug,
  title = "Pripravljeni za prijavo?",
  subtitle = "Termini se hitro polnijo. Rezervirajte mesto za vašega otroka.",
}: ProgramCtaProps) {
  return (
    <section className="relative bg-brand-navy text-white py-14 lg:py-16 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        viewBox="0 0 800 200"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0,200 L0,100 L120,40 L240,90 L360,30 L480,90 L600,50 L720,100 L800,80 L800,200 Z"
          fill="white"
        />
      </svg>

      <div className="relative max-w-3xl mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight leading-[1.1] mb-3">
          {title}
        </h2>
        <p className="text-sm lg:text-base opacity-90 mb-7 max-w-xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href={`/prijava?program=${programSlug}`}
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-brand-orange-dark transition-colors shadow-lg shadow-brand-orange/40"
          >
            Prijavi se na ta program <ArrowRight size={16} />
          </Link>
          <a
            href="tel:064230888"
            className="inline-flex items-center gap-2 bg-transparent text-white px-6 py-3.5 rounded-xl text-sm font-semibold border border-white/30 hover:bg-white/10 transition-colors"
          >
            <Phone size={16} /> 064 230 888
          </a>
        </div>
      </div>
    </section>
  );
}
