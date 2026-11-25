"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Slika } from "./GalerijaMreza";

// Neprekinjen pas fotografij, ki se pomika od desne proti levi (kot tekoči trak).
// Pokončne in "velike" slike zavzamejo celo višino pasu, ostale ležeče se zložijo po dve ena nad drugo.
// Pas se pomika ves čas, klik odpre celozaslonski pregled.

type Stolpec = { tip: "cela"; i: number } | { tip: "vec"; ids: number[] };

export default function FotoTrak({ slike, hitrost = 22 }: { slike: Slika[]; hitrost?: number }) {
  const [odprta, setOdprta] = useState<number | null>(null);
  const [zacetekX, setZacetekX] = useState<number | null>(null);
  const [razmerja, setRazmerja] = useState<Record<number, number>>({});
  // Kolikokrat ponovimo slike v enem traku, da je trak vedno širši od zaslona
  // (pri malo slikah bi se sicer na širokem zaslonu pokazal prazen konec).
  const [ponovi, setPonovi] = useState(1);
  const trakRef = useRef<HTMLDivElement>(null);

  const r = useCallback(
    (i: number) => {
      const s = slike[i];
      return s.w && s.h ? s.w / s.h : razmerja[i] || 4 / 3;
    },
    [slike, razmerja]
  );

  // Razporeditev v stolpce
  const stolpci = useMemo(() => {
    // Ležeče slike se zlagajo v stolpce po 3, 2, 3 …; pokončne po 2 ena nad drugo.
    // Tako je pas debel, na zaslonu pa je hkrati veliko fotografij.
    const out: Stolpec[] = [];
    const vzorec = [3, 2];
    let korak = 0;
    let lezece: number[] = [];
    let pokoncne: number[] = [];
    slike.forEach((_, i) => {
      if (r(i) < 1) {
        pokoncne.push(i);
        if (pokoncne.length === 2) {
          out.push({ tip: "vec", ids: pokoncne });
          pokoncne = [];
        }
      } else {
        lezece.push(i);
        if (lezece.length === vzorec[korak % vzorec.length]) {
          out.push({ tip: "vec", ids: lezece });
          lezece = [];
          korak++;
        }
      }
    });
    [lezece, pokoncne].forEach((g) => {
      if (g.length === 1) out.push({ tip: "cela", i: g[0] });
      else if (g.length > 1) out.push({ tip: "vec", ids: g });
    });
    return out;
  }, [slike, r]);

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

  useEffect(() => {
    const izmeri = () => {
      const el = trakRef.current;
      if (!el) return;
      const enkrat = el.scrollWidth / ponovi;
      if (!enkrat) return;
      const potrebno = Math.max(1, Math.ceil((window.innerWidth + 200) / enkrat));
      if (potrebno !== ponovi) setPonovi(potrebno);
    };
    izmeri();
    window.addEventListener("resize", izmeri);
    return () => window.removeEventListener("resize", izmeri);
  }, [ponovi, stolpci, razmerja]);

  if (slike.length === 0) return null;

  const Fotka = ({ i, deli = 1 }: { i: number; deli?: number }) => {
    const s = slike[i];
    const razm = deli > 1 ? (r(i) < 1 ? 0.8 : 1.33) : r(i);
    const visina = deli > 1 ? `calc((var(--pas) - var(--rez) * ${deli - 1}) / ${deli})` : "var(--pas)";
    return (
      <button
        type="button"
        onClick={() => setOdprta(i)}
        className="group relative overflow-hidden rounded-lg bg-slate-200 shrink-0"
        style={{
          height: visina,
          width: `calc(${visina} * ${razm})`,
        }}
        aria-label={s.naslov || `Fotografija ${i + 1}`}
      >
        <img
          src={s.url}
          alt={s.naslov || "Smučarska akademija"}
          loading="lazy"
          draggable={false}
          onLoad={(e) => {
            if (s.w && s.h) return;
            const im = e.currentTarget;
            if (im.naturalWidth && im.naturalHeight)
              setRazmerja((x) => (x[i] ? x : { ...x, [i]: im.naturalWidth / im.naturalHeight }));
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
  };

  const vsiStolpci = Array.from({ length: ponovi }, () => stolpci).flat();

  const Trak = ({ skrit }: { skrit?: boolean }) => (
    <div
      ref={skrit ? undefined : trakRef}
      className="flex gap-[var(--rez)] pr-[var(--rez)] shrink-0"
      aria-hidden={skrit || undefined}
    >
      {vsiStolpci.map((c, k) =>
        c.tip === "cela" ? (
          <Fotka key={k} i={c.i} />
        ) : (
          <div key={k} className="flex flex-col gap-[var(--rez)] shrink-0">
            {c.ids.map((id) => (
              <Fotka key={`${k}-${id}`} i={id} deli={c.ids.length} />
            ))}
          </div>
        )
      )}
    </div>
  );

  // Trajanje enega kroga: približno sorazmerno s številom slik
  const trajanje = Math.max(40, Math.round((slike.length * 120) / hitrost)) * ponovi;

  return (
    <>
      <style>{`
        @keyframes fototrak { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .fototrak { animation: fototrak ${trajanje}s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .fototrak { animation: none; } .fototrak-okvir { overflow-x: auto; } }
      `}</style>
      <div className="fototrak-okvir relative overflow-hidden [--pas:260px] [--rez:5px] sm:[--pas:320px] sm:[--rez:6px] lg:[--pas:340px]">
        <div className="fototrak flex w-max">
          <Trak />
          <Trak skrit />
        </div>
        {/* mehka robova */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent" />
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
