import Link from "next/link";
import { ArrowRight, ClipboardList, MousePointerClick, PartyPopper } from "lucide-react";

const koraki = [
  {
    icon: MousePointerClick,
    naslov: "1. Izberi program",
    text: "Preglej programe in izberi tistega, ki bo tvojemu otroku najbolj pisan na kožo — od smučanja do plavanja.",
  },
  {
    icon: ClipboardList,
    naslov: "2. Oddaj prijavnico",
    text: "Izpolni spletno prijavnico v nekaj minutah. Po oddaji te kontaktiramo in skupaj uredimo vse podrobnosti.",
  },
  {
    icon: PartyPopper,
    naslov: "3. Vidimo se na vadbi",
    text: "Otrok se pridruži skupini, mi pa poskrbimo za varno, strokovno in zabavno vzdušje od prvega dne.",
  },
];

export default function VpisKoraki() {
  return (
    <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
            <span className="w-6 h-px bg-brand-orange" />
            Enostavno do vpisa
            <span className="w-6 h-px bg-brand-orange" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight">
            Do prve vadbe v treh korakih
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {koraki.map((k, i) => {
            const Icon = k.icon;
            return (
              <div
                key={i}
                className="relative bg-white rounded-2xl border border-slate-200/70 p-7 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-brand-orange mx-auto mb-4 flex items-center justify-center">
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-extrabold text-brand-navy mb-2">
                  {k.naslov}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{k.text}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            href="/prijava"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-7 py-3.5 rounded-xl text-sm font-bold hover:bg-brand-orange-dark transition-colors shadow-lg shadow-brand-orange/30"
          >
            Do prijavnice <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
