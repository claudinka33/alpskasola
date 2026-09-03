"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Mail,
  FileText,
  Settings,
  Users,
  LogOut,
  Send,
  Contact,
  CalendarDays,
  Tag,
  CheckCircle2,
  Euro,
  Clock,
  HardDrive,
  Menu,
  X,
} from "lucide-react";

const IKONE: Record<string, any> = {
  pregled: LayoutDashboard,
  prijavnica: ClipboardList,
  email: Mail,
  prijave: FileText,
  prisotnost: CheckCircle2,
  placila: Euro,
  ure: Clock,
  kontakti: Contact,
  kampanje: Send,
  datoteke: HardDrive,
  termini: CalendarDays,
  cenik: Tag,
  programi: Settings,
  admini: Users,
};

export type Postavka = { kljuc: string; href: string; label: string };
export type Skupina = { label: string | null; postavke: Postavka[] };

const LOGO =
  "https://assets.cdn.filesafe.space/x59KaDfsCMuhMlks5lOI/media/6a1438ede05851175c7a0326.png";

export default function Meni({
  skupine,
  ime,
  vloga,
}: {
  skupine: Skupina[];
  ime: string;
  vloga: string;
}) {
  const [odprt, setOdprt] = useState(false);
  const pot = usePathname();

  // Ob menjavi strani meni zapri
  useEffect(() => {
    setOdprt(false);
  }, [pot]);

  // Ko je meni odprt, stran za njim ne drsi
  useEffect(() => {
    document.body.style.overflow = odprt ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [odprt]);

  const naslov =
    skupine.flatMap((s) => s.postavke).find((p) => pot === p.href || pot.startsWith(p.href + "/"))
      ?.label || "CMS";

  const vsebina = (
    <>
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image src={LOGO} alt="Alpska šola" width={40} height={40} className="h-10 w-auto" />
        <div>
          <div className="text-sm font-bold text-white">CMS</div>
          <div className="text-[10px] text-white/60">Alpska šola</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {skupine.map((s, i) =>
          s.postavke.length === 0 ? null : (
            <div key={s.label || `s${i}`}>
              {s.label && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 mt-5 mb-1">
                  {s.label}
                </div>
              )}
              {s.postavke.map((p) => {
                const Ikona = IKONE[p.kljuc] || FileText;
                const aktiven = pot === p.href || pot.startsWith(p.href + "/");
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                      aktiven
                        ? "bg-white/10 text-white font-semibold"
                        : "text-white/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Ikona size={17} className="shrink-0" /> {p.label}
                  </Link>
                );
              })}
            </div>
          )
        )}
      </nav>

      <div className="mt-10 pt-6 border-t border-white/10">
        <div className="text-xs text-white/60 mb-1">Prijavljen kot</div>
        <div className="text-sm font-semibold text-white">{ime}</div>
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-4">
          {vloga === "admin" ? "Skrbnik" : "Zaposleni"}
        </div>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 text-xs text-white/70 hover:text-brand-orange transition-colors"
          >
            <LogOut size={14} /> Odjava
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Telefon: vrstica na vrhu */}
      <header className="lg:hidden sticky top-0 z-40 bg-brand-navy text-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setOdprt(true)}
          aria-label="Meni"
          className="p-2 -ml-2 rounded-lg hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
        <Image src={LOGO} alt="" width={28} height={28} className="h-7 w-auto rounded" />
        <span className="font-bold truncate">{naslov}</span>
      </header>

      {/* Telefon: predal */}
      {odprt && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOdprt(false)} />
          <aside className="relative w-[82%] max-w-xs bg-brand-navy p-5 overflow-y-auto">
            <button
              onClick={() => setOdprt(false)}
              aria-label="Zapri"
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
            {vsebina}
          </aside>
        </div>
      )}

      {/* Računalnik: stalna stranska vrstica */}
      <aside className="hidden lg:block w-64 shrink-0 bg-brand-navy min-h-screen p-6 sticky top-0 self-start overflow-y-auto max-h-screen">
        {vsebina}
      </aside>
    </>
  );
}
