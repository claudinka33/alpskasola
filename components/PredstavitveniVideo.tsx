"use client";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/* --------------------------------------------------------------
   Predstavitveni video na začetku domače strani.
   Glavni video se sam predvaja brez zvoka, ko je na zaslonu, in se
   ustavi, ko greš mimo. Spodaj sta še dva videa — klik ju zamenja.
   Vrstni red spodaj: prvi je glavni.
   -------------------------------------------------------------- */
const videi = [
  { id: "jOtYv0mTmSc", naslov: "Poletne priprave na Rogli" },
  { id: "atf-TQXUdSQ", naslov: "Poletje v Baški" },
  { id: "W7UljiUO58U", naslov: "Priprave na ledeniku" },
];

function ukaz(iframe: HTMLIFrameElement | null, func: "playVideo" | "pauseVideo" | "mute") {
  iframe?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
}

export default function PredstavitveniVideo() {
  const [izbran, setIzbran] = useState(0);
  const [nalozi, setNalozi] = useState(false);
  const ovoj = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const viden = useRef(false);

  useEffect(() => {
    const el = ovoj.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setNalozi(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        viden.current = e.isIntersecting;
        if (e.isIntersecting) {
          setNalozi(true);
          ukaz(iframe.current, "playVideo");
        } else {
          ukaz(iframe.current, "pauseVideo");
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const v = videi[izbran];
  const manjGibanja =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const src =
    `https://www.youtube-nocookie.com/embed/${v.id}?enablejsapi=1&mute=1&playsinline=1&rel=0` +
    `&modestbranding=1&loop=1&playlist=${v.id}&autoplay=${manjGibanja ? 0 : 1}`;

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-8">
        {/* Besedilo + izbira videa */}
        <div>
          <div className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
            <span className="h-px w-6 bg-brand-orange" />
            To smo mi
          </div>
          <h2 className="mb-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-navy lg:text-4xl">
            Spoznajte Alpsko šolo
          </h2>
          <p className="mb-6 text-base leading-relaxed text-slate-600">
            Poglejte, kako je videti dan z nami — na snegu, na pripravah in na poletnih taborih.
          </p>
          <div className="space-y-2">
            {videi.map((x, i) => (
              <button
                key={x.id}
                type="button"
                onClick={() => {
                  setIzbran(i);
                  setNalozi(true);
                }}
                className={`flex w-full items-center gap-3 rounded-xl border p-2 pr-4 text-left transition ${
                  i === izbran
                    ? "border-brand-orange bg-orange-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="relative block h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-brand-navy/30">
                    <Play size={14} fill="white" className="text-white" />
                  </span>
                </span>
                <span className="text-sm font-bold text-brand-navy">{x.naslov}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Video */}
        <div
          ref={ovoj}
          className="relative aspect-video overflow-hidden rounded-2xl bg-brand-navy shadow-xl ring-1 ring-slate-200"
        >
          {nalozi ? (
            <iframe
              ref={iframe}
              key={v.id}
              className="absolute inset-0 h-full w-full"
              src={src}
              title={v.naslov}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ border: "none" }}
              onLoad={() => {
                if (viden.current && !manjGibanja) ukaz(iframe.current, "playVideo");
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
