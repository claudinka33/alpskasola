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
  Snowflake,
  Baby,
} from "lucide-react";

const programs = [
  {
    icon: Waves,
    title: "Tečaj plavanja",
    description: "Varno in zabavno učenje plavanja v Termah Zreče.",
    href: "/plavalni-tecaj",
    tag: null,
    accent: "bg-cyan-100 text-cyan-600",
    image: "/plavalni-tecaj/04.jpg",
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
    title: "Alpska šola smučanja",
    description: "Za otroke od 6. leta — od začetnikov do izkušenih.",
    href: "/sola-smucanja",
    tag: "PRIJAVE ODPRTE",
    accent: "bg-blue-100 text-blue-600",
    image: "/tecaj-smucanja/03.jpg",
  },
  {
    icon: Snowflake,
    title: "Alpska šola bordanja",
    description: "Za mlade deskarje od 6. leta naprej.",
    href: "/tecaj-bordanja",
    tag: "PRIJAVE ODPRTE",
    accent: "bg-sky-100 text-sky-600",
    image: "/tecaj-bordanja/07.jpg",
  },
  {
    icon: Baby,
    title: "Mini alpska šola",
    description: "Prvi koraki na smučeh za malčke od 4 do 6 let.",
    href: "/mini-alpska-sola",
    tag: "PRIJAVE ODPRTE",
    accent: "bg-rose-100 text-rose-600",
    image: "/mini-alpska-sola/01.jpg",
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
    image: "/akademija-galerija/tekmovalci-smuci.jpg",
  },
  {
    icon: Bike,
    title: "Tečaj rolanja",
    description: "Spomladi in poleti — gibanje na kolesih.",
    href: "/sola-rolanja",
    tag: null,
    accent: "bg-teal-100 text-teal-600",
    image: "/sola-rolanja/01.jpg", // TODO: dodaj fotografijo rolanja, ko jo dobimo
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

// Razvrstitev na domači strani (po href): zima, vse leto, storitve
const ZIMA = ["/mini-alpska-sola", "/sola-smucanja", "/tecaj-bordanja", "/smucarska-akademija", "/ski-racing-team"];
const VSE_LETO = ["/plavalni-tecaj", "/sola-rolanja", "/sportna-abeceda", "/praznovanje-rojstnega-dne"];
const STORITVE = ["/servis", "/izposoja-opreme"];
const po = (seznam: string[]) =>
  seznam.map((h) => programs.find((p) => p.href === h)).filter(Boolean) as typeof programs;

function Kartica({
  program,
  className = "",
  siroka = false,
}: {
  program: (typeof programs)[number];
  className?: string;
  siroka?: boolean;
}) {
  const Icon = program.icon;
  return (
    <Link
      href={program.href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-xl hover:shadow-brand-navy/5 ${className}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${siroka ? "aspect-[4/3] lg:aspect-[2/1]" : "aspect-[4/3]"} from-blue-50 to-slate-100`}>
        {program.image ? (
          <img
            src={program.image}
            alt={program.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${program.accent}`}>
              <Icon size={40} />
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-navy/80 to-transparent" />
        <h3 className="absolute bottom-3 left-4 right-4 text-lg font-extrabold leading-snug text-white drop-shadow">
          {program.title}
        </h3>
        {program.tag && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-orange px-2.5 py-1 text-[10px] font-bold tracking-wider text-white shadow-lg">
            {program.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 items-end justify-between gap-3 p-4">
        <p className="text-sm leading-relaxed text-slate-600">{program.description}</p>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-50 text-brand-orange transition group-hover:bg-brand-orange group-hover:text-white">
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

function Naslov({ znacka, naslov }: { znacka: string; naslov: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
      <div>
        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-orange">{znacka}</div>
        <h3 className="text-2xl font-extrabold tracking-tight text-brand-navy lg:text-3xl">{naslov}</h3>
      </div>
    </div>
  );
}

export default function Programs() {
  return (
    <section id="programi" className="scroll-mt-24 lg:scroll-mt-40 bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 2xl:max-w-[88rem]">
        <div className="mb-10 text-center lg:mb-14">
          <div className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
            <span className="h-px w-6 bg-brand-orange" />
            Naši programi
            <span className="h-px w-6 bg-brand-orange" />
          </div>
          <h2 className="mb-3 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-navy lg:text-5xl">
            Z nami v gibanju vse leto
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600">
            Od prvih korakov na smučeh do tekmovalne kariere. Pozimi na Rogli, poleti v vodi, na rolerjih in igrišču.
          </p>
        </div>

        <Naslov znacka="❄️ Zima na Rogli" naslov="Smučanje in bordanje" />
        {/* Prvi trije čez 3 stolpce, zadnja dva (akademija, tekmovalne) širše čez 2 */}
        <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {po(ZIMA).map((p, i) => (
            <Kartica key={p.href} program={p} siroka={i >= 3} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"} />
          ))}
        </div>

        <Naslov znacka="☀️ Poleti in vse leto" naslov="Plavanje, rolanje in igra" />
        <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {po(VSE_LETO).map((p) => (
            <Kartica key={p.href} program={p} />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {po(STORITVE).map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.href}
                href={p.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-3 pr-5 transition hover:border-brand-orange/40 hover:bg-white hover:shadow-lg"
              >
                <img src={p.image!} alt={p.title} loading="lazy" className="h-16 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-bold text-brand-navy">
                    <Icon size={16} className="text-brand-orange" /> {p.title}
                  </div>
                  <div className="text-sm text-slate-600">{p.description}</div>
                </div>
                <ArrowRight size={18} className="text-brand-orange transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
