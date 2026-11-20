"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type Slika = { url: string; naslov?: string | null; w?: number; h?: number; velika?: boolean };
export type Video = { id: string; naslov?: string | null };

// Mozaik fotografij s celozaslonskim pregledovalnikom (puščice, tipkovnica, poteg s prstom)
export function FotoMreza({ slike }: { slike: Slika[] }) {
  const [odprta, setOdprta] = useState<number | null>(null);
  const [zacetekX, setZacetekX] = useState<number | null>(null);

  const naprej = useCallback(
    () => setOdprta((i) => (i === null ? i : (i + 1) % slike.length)),
    [slike.length]
  );
  const nazaj = useCallback(
    () => setOdprta((i) => (i === null ? i : (i - 1 + slike.length) % slike.length)),
    [slike.length]
  );

  useEffect(() => {
    if (odprta === null) return;
    const tipka = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOdprta(null);
      if (e.key === "ArrowRight") naprej();
      if (e.key === "ArrowLeft") nazaj();
    };
    window.addEventListener("keydown", tipka);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tipka);
      document.body.style.overflow = "";
    };
  }, [odprta, naprej, nazaj]);

  if (slike.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {slike.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOdprta(i)}
            className={`group relative overflow-hidden rounded-xl bg-slate-100 ${
              i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
            }`}
            aria-label={s.naslov || `Fotografija ${i + 1}`}
          >
            <img
              src={s.url}
              alt={s.naslov || "Smučarska akademija"}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {s.naslov && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-semibold text-left px-3 pt-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {s.naslov}
              </span>
            )}
          </button>
        ))}
      </div>

      {odprta !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setOdprta(null)}
          onTouchStart={(e) => setZacetekX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (zacetekX === null) return;
            const dx = e.changedTouches[0].clientX - zacetekX;
            if (dx > 50) nazaj();
            if (dx < -50) naprej();
            setZacetekX(null);
          }}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
            onClick={() => setOdprta(null)}
            aria-label="Zapri"
          >
            <X size={28} />
          </button>
          {slike.length > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-6 p-2 text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  nazaj();
                }}
                aria-label="Prejšnja"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                className="absolute right-2 sm:right-6 p-2 text-white/80 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  naprej();
                }}
                aria-label="Naslednja"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}
          <figure className="max-w-[92vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={slike[odprta].url}
              alt={slike[odprta].naslov || ""}
              className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg"
            />
            <figcaption className="text-center text-white/80 text-sm mt-3">
              {slike[odprta].naslov && <span className="font-semibold text-white">{slike[odprta].naslov} · </span>}
              {odprta + 1} / {slike.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

// Vodoravni kolaž — vrstice poravnane čez celo širino, pokončne slike ostanejo pokončne,
// ležeče ležeče; slike z oznako "velika" so večje. Klik odpre celozaslonski pregled.
export function FotoKolaz({ slike }: { slike: Slika[] }) {
  const [odprta, setOdprta] = useState<number | null>(null);
  const [zacetekX, setZacetekX] = useState<number | null>(null);
  // Razmerja slik, ki nimajo podanih mer (npr. naložene v CMS) — preberemo jih ob nalaganju
  const [razmerja, setRazmerja] = useState<Record<number, number>>({});

  const naprej = useCallback(
    () => setOdprta((i) => (i === null ? i : (i + 1) % slike.length)),
    [slike.length]
  );
  const nazaj = useCallback(
    () => setOdprta((i) => (i === null ? i : (i - 1 + slike.length) % slike.length)),
    [slike.length]
  );

  useEffect(() => {
    if (odprta === null) return;
    const tipka = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOdprta(null);
      if (e.key === "ArrowRight") naprej();
      if (e.key === "ArrowLeft") nazaj();
    };
    window.addEventListener("keydown", tipka);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tipka);
      document.body.style.overflow = "";
    };
  }, [odprta, naprej, nazaj]);

  if (slike.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 [--h:80px] sm:[--h:150px] lg:[--h:190px]">
        {slike.map((s, i) => {
          const r = s.w && s.h ? s.w / s.h : razmerja[i] || 4 / 3;
          const k = s.velika ? 1.6 : 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOdprta(i)}
              className="group relative overflow-hidden rounded-lg bg-slate-100"
              style={{ flexGrow: r * k * 100, flexBasis: `calc(var(--h) * ${r * k})` }}
              aria-label={s.naslov || `Fotografija ${i + 1}`}
            >
              <span className="block" style={{ paddingBottom: `${100 / r}%` }} />
              <img
                src={s.url}
                alt={s.naslov || "Smučarska akademija"}
                loading="lazy"
                onLoad={(e) => {
                  if (s.w && s.h) return;
                  const im = e.currentTarget;
                  if (im.naturalWidth && im.naturalHeight)
                    setRazmerja((x) => ({ ...x, [i]: im.naturalWidth / im.naturalHeight }));
                }}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {s.naslov && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs sm:text-sm font-semibold text-left px-3 pt-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {s.naslov}
                </span>
              )}
            </button>
          );
        })}
        {/* polnilo, da se zadnja vrstica ne raztegne */}
        <div className="h-0" style={{ flexGrow: 1e6 }} />
      </div>

      {odprta !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setOdprta(null)}
          onTouchStart={(e) => setZacetekX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (zacetekX === null) return;
            const dx = e.changedTouches[0].clientX - zacetekX;
            if (dx > 50) nazaj();
            if (dx < -50) naprej();
            setZacetekX(null);
          }}
        >
          <button className="absolute top-4 right-4 p-2 text-white/80 hover:text-white" onClick={() => setOdprta(null)} aria-label="Zapri">
            <X size={28} />
          </button>
          {slike.length > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-6 p-2 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); nazaj(); }}
                aria-label="Prejšnja"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                className="absolute right-2 sm:right-6 p-2 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); naprej(); }}
                aria-label="Naslednja"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}
          <figure className="max-w-[92vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img src={slike[odprta].url} alt={slike[odprta].naslov || ""} className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg" />
            <figcaption className="text-center text-white/80 text-sm mt-3">
              {slike[odprta].naslov && <span className="font-semibold text-white">{slike[odprta].naslov} · </span>}
              {odprta + 1} / {slike.length}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

// Video predvajalnik: velik video + seznam ostalih ob strani (na telefonu pod njim, vodoravno).
// Glavni video se ob prihodu v vidno polje sam zažene (utišan), ob odhodu se ustavi.
export function VideoMreza({ videi }: { videi: Video[] }) {
  const [izbran, setIzbran] = useState(0);
  const [nalozen, setNalozen] = useState(false);
  const okvir = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);

  const ukaz = (func: string) =>
    iframe.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");

  useEffect(() => {
    const el = okvir.current;
    if (!el) return;
    const o = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNalozen(true);
          ukaz("playVideo");
        } else ukaz("pauseVideo");
      },
      { threshold: 0.5 }
    );
    o.observe(el);
    return () => o.disconnect();
  }, []);

  if (videi.length === 0) return null;
  const v = videi[izbran];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_340px] gap-4 lg:gap-5">
      <div>
        <div ref={okvir} className="aspect-video relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {nalozen ? (
            <iframe
              key={v.id}
              ref={iframe}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&mute=1&playsinline=1&rel=0&enablejsapi=1`}
              title={v.naslov || "Video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ border: "none" }}
            />
          ) : (
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
        {v.naslov && <h3 className="text-white font-bold text-lg mt-3">{v.naslov}</h3>}
      </div>

      {videi.length > 1 && (
        <div className="relative">
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:absolute lg:inset-0 pb-2 lg:pb-0 snap-x lg:snap-y lg:pr-1 [scrollbar-width:thin]">
          {videi.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => {
                setIzbran(i);
                setNalozen(true);
              }}
              className={`snap-start shrink-0 w-44 lg:w-full flex flex-col lg:flex-row gap-2 lg:gap-3 items-start text-left rounded-xl p-1.5 transition ${
                i === izbran ? "bg-white/15 ring-2 ring-brand-orange" : "hover:bg-white/10"
              }`}
            >
              <span className="relative w-full lg:w-32 aspect-video shrink-0 rounded-lg overflow-hidden bg-black">
                <img src={`https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                {i === izbran && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-bold uppercase tracking-wider">
                    Predvaja
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold text-white/90 leading-snug lg:pt-1">{x.naslov || "Video"}</span>
            </button>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
