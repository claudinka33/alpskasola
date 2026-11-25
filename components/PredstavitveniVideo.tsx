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
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-8 text-center lg:mb-10">
          <div className="mb-3 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-brand-orange">
            <span className="h-px w-6 bg-brand-orange" />
            To smo mi
            <span className="h-px w-6 bg-brand-orange" />
          </div>
          <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-brand-navy lg:text-5xl">
            Spoznajte Alpsko šolo
          </h2>
        </div>

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

        <div className="mt-4 grid grid-cols-3 gap-3 lg:gap-4">
          {videi.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => {
                setIzbran(i);
                setNalozi(true);
              }}
              className={`group relative overflow-hidden rounded-xl text-left ring-2 transition ${
                i === izbran ? "ring-brand-orange" : "ring-transparent hover:ring-slate-300"
              }`}
            >
              <span className="relative block aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-brand-navy/30" />
                {i !== izbran && (
                  <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-orange text-white">
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                  </span>
                )}
              </span>
              <span className="block bg-white px-2 py-2 text-xs font-bold text-brand-navy sm:text-sm">
                {x.naslov}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
