// Alpi — maskota Alpske šole. Slike so v /public/alpi (prozorno ozadje, .webp).
export type AlpiPoza = "palca" | "maha" | "smuci" | "servis" | "skok" | "bord" | "kaze" | "smuca";

const OPIS: Record<AlpiPoza, string> = {
  palca: "Alpi kaže palca gor",
  maha: "Alpi pomaha",
  smuci: "Alpi s smučmi",
  servis: "Alpi s ključem za servis",
  skok: "Alpi skoči od veselja",
  bord: "Alpi na deski",
  kaze: "Alpi pokaže",
  smuca: "Alpi smuča",
};

export default function Alpi({
  poza = "maha",
  className = "",
  alt,
}: {
  poza?: AlpiPoza;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src={`/alpi/${poza}.webp`}
      alt={alt ?? OPIS[poza]}
      loading="lazy"
      draggable={false}
      className={`select-none pointer-events-none ${className}`}
    />
  );
}

// Oblaček z besedilom (govorni balon) — postavi ga ob Alpija.
export function AlpiOblacek({
  children,
  rep = "levo",
  className = "",
}: {
  children: React.ReactNode;
  rep?: "levo" | "desno" | "spodaj";
  className?: string;
}) {
  const repCls =
    rep === "levo"
      ? "left-[-6px] top-1/2 -translate-y-1/2"
      : rep === "desno"
      ? "right-[-6px] top-1/2 -translate-y-1/2"
      : "left-1/2 bottom-[-6px] -translate-x-1/2";
  return (
    <div
      className={`relative rounded-2xl bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-brand-navy shadow-lg shadow-brand-navy/15 border-2 border-brand-navy ${className}`}
    >
      {children}
      <span className={`absolute h-3 w-3 rotate-45 bg-white border-brand-navy ${repCls} ${
        rep === "levo" ? "border-l-2 border-b-2" : rep === "desno" ? "border-r-2 border-t-2" : "border-r-2 border-b-2"
      }`} />
    </div>
  );
}

// Alpi med dvema sekcijama — stoji na meji, viden cel, na telefonu manjši.
export function AlpiVmes({
  poza = "smuca",
  stran = "desno",
}: {
  poza?: AlpiPoza;
  stran?: "levo" | "desno";
}) {
  return (
    <div className="relative z-20 h-0" aria-hidden>
      <Alpi
        poza={poza}
        className={`absolute -top-12 sm:-top-16 lg:-top-20 h-24 sm:h-32 lg:h-40 w-auto drop-shadow-xl animate-alpi-smuca ${
          stran === "desno" ? "right-3 sm:right-[6%]" : "left-3 sm:left-[6%]"
        }`}
      />
    </div>
  );
}
