import { Facebook, ArrowRight } from "lucide-react";

/* Majhen pas s povezavo na Facebook — spodaj na domači strani. */
const FB = "https://www.facebook.com/alpskasola/";

export default function FacebookPas() {
  return (
    <section className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1877F2] text-white">
            <Facebook size={20} />
          </span>
          <p className="text-sm text-slate-600">
            <span className="font-bold text-brand-navy">Smo tudi na Facebooku</span> — obvestila,
            novice in slike z naših tečajev in tekem.
          </p>
        </div>
        <a
          href={FB}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Facebook stran <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
