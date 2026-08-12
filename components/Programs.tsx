import Link from "next/link";
import {
  ArrowRight,
  Mountain,
  Trophy,
  Award,
  Waves,
  Activity,
  Bike,
  Wrench,
  Package,
  Cake,
} from "lucide-react";

const programs = [
  {
    icon: Waves,
    title: "Tečaj plavanja",
    description: "Varno in zabavno učenje plavanja v Termah Zreče.",
    href: "/plavalni-tecaj",
    tag: "★ POLETNI HIT",
    accent: "bg-cyan-100 text-cyan-600",
    image: "/plavalni-tecaj.png",
  },
  {
    icon: Cake,
    title: "Rojstni dan z Alpsko šolo",
    description: "3 paketi: vodna, športna in nogometna zabava.",
    href: "/praznovanje-rojstnega-dne",
    tag: "★ NOVO",
    accent: "bg-pink-100 text-pink-600",
    image: "/rojsnidan.png",
  },
  {
    icon: Activity,
    title: "Športna abeceda",
    description: "Gibalna vzgoja za vrtce in osnovne šole.",
    href: "/sportna-abeceda",
    tag: null,
    accent: "bg-emerald-100 text-emerald-600",
    image: "/abeceda.JPG",
  },
  {
    icon: Mountain,
    title: "Tečaji smučanja in bordanja",
    description: "Za vse stopnje znanja — od začetnikov do izkušenih.",
    href: "/sola-smucanja",
    tag: null,
    accent: "bg-blue-100 text-blue-600",
    image: "/smucanje.jpg",
  },
  {
    icon: Trophy,
    title: "Tekmovalne ekipe",
    description: "Resni treningi, slovenski pokal, mednarodne tekme.",
    href: "/ski-racing-team",
    tag: null,
    accent: "bg-amber-100 text-amber-600",
    image: "/tekmovalnaslika.jpg",
  },
  {
    icon: Award,
    title: "Smučarska akademija",
    description: "Poglobljen program za nadarjene mlade smučarje.",
    href: "/smucarska-akademija",
    tag: null,
    accent: "bg-violet-100 text-violet-600",
    image: "/zimskeaktivnosti.jpeg",
  },
  {
    icon: Bike,
    title: "Tečaj rolanja",
    description: "Spomladi in poleti — gibanje na kolesih.",
    href: "/sola-rolanja",
    tag: null,
    accent: "bg-teal-100 text-teal-600",
    image: null, // TODO: dodaj fotografijo rolanja, ko jo dobimo
  },
  {
    icon: Wrench,
    title: "Servis smuči",
    description: "Profesionalna priprava smuči in deske.",
    href: "/servis",
    tag: null,
    accent: "bg-slate-100 text-slate-600",
    image: "/servis.JPG",
  },
  {
    icon: Package,
    title: "Izposoja opreme",
    description: "Kakovostna smučarska oprema za vse starosti.",
    href: "/izposoja-opreme",
    tag: null,
    accent: "bg-orange-100 text-orange-600",
    image: "/Izposoja.JPG",
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
            Z nami v gibanju vse leto
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Od prvih korakov na smučeh do tekmovalne kariere. Plavanje, rolanje,
            športna abeceda — z nami otroci ostajajo v gibanju vse leto.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {programs.map((program, i) => {
            const Icon = program.icon;
            return (
              <Link
                key={i}
                href={program.href}
                className="group relative bg-white rounded-2xl border border-slate-200/70 overflow-hidden hover:border-brand-orange/40 hover:shadow-xl hover:shadow-brand-navy/5 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Fotografija */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
                  {program.image ? (
                    <img
                      src={program.image}
                      alt={program.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${program.accent}`}>
                        <Icon size={40} />
                      </div>
                    </div>
                  )}
                  {program.tag && (
                    <span className="absolute top-3 right-3 bg-brand-orange text-white px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-lg">
                      {program.tag}
                    </span>
                  )}
                </div>

                <div className="p-5 lg:p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${program.accent}`}
                    >
                      <Icon size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-brand-navy leading-snug">
                      {program.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-1">
                    {program.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-orange group-hover:gap-2.5 transition-all">
                    Več o programu <ArrowRight size={15} />
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
