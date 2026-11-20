"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

export type Slika = { url: string; naslov?: string | null };
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

// YouTube kartice — video se naloži šele ob kliku (hitrejša stran, brez piškotkov do klika)
export function VideoMreza({ videi }: { videi: Video[] }) {
  const [predvaja, setPredvaja] = useState<string | null>(null);
  if (videi.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 gap-6 ${videi.length === 1 ? "max-w-3xl mx-auto" : videi.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
      {videi.map((v) => (
        <div key={v.id} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
          <div className="aspect-video relative bg-black">
            {predvaja === v.id ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
                title={v.naslov || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: "none" }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPredvaja(v.id)}
                className="group absolute inset-0 w-full h-full"
                aria-label={`Predvajaj: ${v.naslov || "video"}`}
              >
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play size={28} className="ml-1" fill="currentColor" />
                  </span>
                </span>
              </button>
            )}
          </div>
          {v.naslov && (
            <div className="p-4">
              <h3 className="text-sm font-bold text-brand-navy">{v.naslov}</h3>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
