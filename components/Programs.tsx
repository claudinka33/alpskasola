import Link from "next/link";
import {
  ArrowRight,
  Mountain,
  Trophy,
  Award,
  Waves,
  Activity,
  Bike,
  Cake,
  Wrench,
  Package,
} from "lucide-react";

const programs = [
  {
    icon: Waves,
    title: "Tečaj plavanja",
    description: "Varno in zabavno učenje plavanja v Termah Zreče.",
    href: "/plavalni-tecaj",
    tag: "★ POLETNI HIT",
  },
  {
    icon: Cake,
    title: "Rojstni dan z Alpsko šolo",
    description: "3 paketi: vodna, športna in nogometna zabava.",
    href: "/praznovanje-rojstnega-dne",
    tag: "★ NOVO",
  },
  {
    icon: Activity,
    title: "Športna abeceda",
    description: "Gibalna vzgoja za vrtce in osnovne šole.",
    href: "/sportna-abeceda",
    tag: null,
  },
  {
    icon: Mountain,
    title: "Tečaji smučanja in bordanja",
    description: "Za vse stopnje znanja — od začetnikov do izkušenih.",
    href: "/sola-smucanja",
    tag: null,
  },
  {
    icon: Trophy,
    title: "Tekmovalne ekipe",
    description: "Resni treningi, slovenski pokal, mednarodne tekme.",
    href: "/ski-racing-team",
    tag: null,
  },
  {
    icon: Award,
    title: "Smučarska akademija",
    description: "Poglobljen program za nadarjene mlade smučarje.",
    href: "/smucarska-akademija",
    tag: null,
  },
  {
    icon: Bike,
    title: "Tečaj rolanja",
    description: "Spomladi in poleti — gibanje na kolesih.",
    href: "/sola-rolanja",
    tag: null,
  },
  {
    icon: Wrench,
    title: "Servis smuči",
    description: "Profesionalna priprava smuči in deske.",
    href: "/servis",
    tag: null,
  },
  {
    icon: Package,
    title: "Izposoja opreme",
    description: "Kakovostna smučarska oprema za vse starosti.",
    href: "/izposoja-opreme",
    tag: null,
  },
];

export default function Programs() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
            <span className="w-6 h-px bg-brand-orange" />
            Naši programi
            <span className="w-6 h-px bg-brand-orange" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-brand-navy tracking-tight leading-[1.1] mb-3">
            Vsaka sezona, vsak šport.
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Od prvih korakov na smučeh do tekmovalne kariere. Plavanje, rolanje,
            športna abeceda — z nami otroci ostajajo v gibanju vse leto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {programs.map((program, i) => {
            const Icon = program.icon;
            return (
              <Link
                key={i}
                href={program.href}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:border-brand-orange/40 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-32 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-brand-navy overflow-hidden">
                  <Icon size={44} className="relative z-10" />
                  <div className="absolute bottom-[-20px] left-[-20%] right-[-20%] h-16 bg-white/40 rounded-t-full" />
                  {program.tag && (
                    <span className="absolute top-3 right-3 bg-white text-brand-orange px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider z-20">
                      {program.tag}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-brand-navy mb-1.5">
                    {program.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {program.description}
                  </p>
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-brand-orange group-hover:gap-2.5 transition-all">
                    Več o programu <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
