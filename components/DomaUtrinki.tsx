import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FotoTrak from "@/components/FotoTrak";
import type { Slika } from "@/components/GalerijaMreza";

// Utrinki z vseh programov na domači strani (neskončen trak, klik odpre sliko čez cel zaslon)
const slike: Slika[] = [
  { url: "/mini-alpska-sola/15.jpg", naslov: "Mini alpska šola — na startu", w: 1050, h: 1400 },
  { url: "/tecaj-smucanja/03.jpg", naslov: "Alpska šola smučanja", w: 1050, h: 1400 },
  { url: "/tecaj-bordanja/08.jpg", naslov: "Alpska šola bordanja", w: 1050, h: 1400 },
  { url: "/plavalni-tecaj/03.jpg", naslov: "Plavalni tečaj", w: 960, h: 720 },
  { url: "/mini-alpska-sola/17.jpg", naslov: "Na tekočem traku", w: 1050, h: 1400 },
  { url: "/tecaj-smucanja/11.jpg", naslov: "Na sedežnici", w: 1400, h: 1050 },
  { url: "/sola-rolanja/07.jpg", naslov: "Tečaj rolanja", w: 1316, h: 640 },
  { url: "/mini-alpska-sola/26.jpg", naslov: "Medalja za vsakega", w: 1120, h: 1400 },
  { url: "/tecaj-smucanja/14.jpg", naslov: "Pripravljeni na spust", w: 1050, h: 1400 },
  { url: "/tecaj-bordanja/01.jpg", naslov: "Prvi koraki z desko", w: 1050, h: 1400 },
  { url: "/mini-alpska-sola/30.jpg", naslov: "Z učiteljicama", w: 1050, h: 1400 },
  { url: "/plavalni-tecaj/04.jpg", naslov: "Diplome s plavalnega tečaja", w: 720, h: 960 },
  { url: "/tecaj-smucanja/01.jpg", naslov: "Navodila pred spustom", w: 1050, h: 1400 },
  { url: "/mini-alpska-sola/02.jpg", naslov: "Igre v krogu", w: 1050, h: 1400 },
  { url: "/sola-rolanja/01.jpg", naslov: "Diplome za rolarje", w: 960, h: 720 },
  { url: "/tecaj-bordanja/05.jpg", naslov: "Samostojna vožnja", w: 1024, h: 680 },
  { url: "/mini-alpska-sola/20.jpg", naslov: "V predoru tekočega traku", w: 1050, h: 1400 },
  { url: "/tecaj-smucanja/07.jpg", naslov: "Jutranje ogrevanje", w: 1050, h: 1400 },
];

export default function DomaUtrinki() {
  return (
    <section className="overflow-hidden bg-slate-50 py-14 lg:py-20">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col items-start justify-between gap-4 px-5 sm:flex-row sm:items-end sm:px-6 lg:px-8 2xl:max-w-[88rem]">
        <div>
          <div className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
            <span className="h-px w-6 bg-brand-orange" />
            Utrinki
          </div>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-navy lg:text-5xl">
            Nasmehi, ki povedo vse
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
            Pravi trenutki z naših tečajev — na snegu, v vodi in na igrišču.
          </p>
        </div>
        <Link
          href="/prijava"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-orange-dark"
        >
          Prijavi otroka <ArrowRight size={16} />
        </Link>
      </div>
      <FotoTrak slike={slike} />
    </section>
  );
}
