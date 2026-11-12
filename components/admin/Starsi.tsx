"use client";

import { Search, X, Mail, Phone } from "lucide-react";

export type PodatkiStarsa = {
  starsi_ime?: string | null;
  starsi_priimek?: string | null;
  email?: string | null;
  telefon?: string | null;
};

// Odstrani šumnike in velike črke, da "Zbicajnik" najde "Zbičajnik"
const normaliziraj = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Ali otrok ustreza iskanju — po imenu in priimku otroka (v poljubnem vrstnem redu),
// pa tudi po staršu, emailu ali telefonu.
export function ustrezaIskanju(
  o: PodatkiStarsa & { otrok_ime?: string | null; otrok_priimek?: string | null; ime?: string | null },
  iskanje: string
) {
  const q = normaliziraj(iskanje);
  if (!q) return true;
  const besedilo = normaliziraj(
    [
      o.ime,
      o.otrok_ime,
      o.otrok_priimek,
      o.starsi_ime,
      o.starsi_priimek,
      o.email,
      (o.telefon || "").replace(/\s+/g, ""),
    ]
      .filter(Boolean)
      .join(" ")
  );
  return q.split(" ").every((del) => besedilo.includes(del.replace(/\s+/g, "")));
}

export function IskalnikOtrok({
  vrednost,
  onChange,
  className = "",
}: {
  vrednost: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={vrednost}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Išči otroka (ime, priimek)…"
        className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange"
      />
      {vrednost && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
          aria-label="Počisti iskanje"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Drobna vrstica pod imenom otroka: starš · email · telefon
export function StarsVrstica({ o, className = "" }: { o: PodatkiStarsa; className?: string }) {
  const ime = [o.starsi_ime, o.starsi_priimek].filter(Boolean).join(" ").trim();
  if (!ime && !o.email && !o.telefon) return null;
  const ustavi = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div className={`text-[11px] font-normal text-slate-500 leading-snug flex flex-wrap gap-x-3 gap-y-0.5 ${className}`}>
      {ime && <span>{ime}</span>}
      {o.email && (
        <a href={`mailto:${o.email}`} onClick={ustavi} className="inline-flex items-center gap-1 hover:text-brand-orange">
          <Mail size={10} /> {o.email}
        </a>
      )}
      {o.telefon && (
        <a href={`tel:${o.telefon.replace(/\s+/g, "")}`} onClick={ustavi} className="inline-flex items-center gap-1 hover:text-brand-orange">
          <Phone size={10} /> {o.telefon}
        </a>
      )}
    </div>
  );
}
