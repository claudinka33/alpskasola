"use client";

// Lupina administracije v kompaktnem ERP slogu:
// zgoraj temno modra vrstica z iskalnikom, levo moduli, na telefonu spodnja vrstica
// z glavnim gumbom »Nova prijava« v sredini. Vsebina strani ostane enaka.
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Mail, FileText, Settings, Users, LogOut, Send, Contact,
  CalendarDays, Tag, CheckCircle2, Euro, Clock, HardDrive, Menu, X, Mountain, Images,
  Search, Plus, UserRound, FileDown, Cake,
} from "lucide-react";
import type { Skupina } from "./Meni";

// Ikona po poti modula (zadnji del naslova)
const IKONE: Record<string, any> = {
  admin: LayoutDashboard, tecajniki: UserRound, prijavnica: ClipboardList, email: Mail, prijave: FileText,
  izvoz: FileDown, prisotnost: CheckCircle2, placila: Euro, ure: Clock, ekipa: Mountain, kontakti: Contact,
  kampanje: Send, datoteke: HardDrive, termini: ClipboardList, cenik: Tag, galerija: Images,
  "rojstni-dan": ClipboardList, programi: Settings, admini: Users,
};
const ikona = (href: string) => IKONE[href.split("/").filter(Boolean).pop() || "admin"] || FileText;

export default function Lupina({
  skupine, ime, vloga, children,
}: { skupine: Skupina[]; ime: string; vloga: string; children: React.ReactNode }) {
  const [odprt, setOdprt] = useState(false);
  const [iskanje, setIskanje] = useState("");
  const pot = usePathname();
  const router = useRouter();

  useEffect(() => setOdprt(false), [pot]);
  useEffect(() => {
    document.body.style.overflow = odprt ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [odprt]);

  const vse = skupine.flatMap((s) => s.postavke);
  const ujema = (h: string) => pot === h || pot.startsWith(h + "/");
  const trenutna = vse
    .filter((p) => ujema(p.href) || (p.tudi || []).some(ujema))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const ima = (k: string) => vse.some((p) => p.kljuc === k);
  const imaPot = (h: string) => vse.some((p) => p.href === h);

  const isci = (e: React.FormEvent) => {
    e.preventDefault();
    const q = iskanje.trim();
    router.push(q ? `/admin/tecajniki?q=${encodeURIComponent(q)}` : "/admin/tecajniki");
  };

  const meni = (
    <nav aria-label="Moduli" className="py-2">
      {skupine.map((s, i) =>
        s.postavke.length === 0 ? null : (
          <div key={s.label || `s${i}`}>
            {s.label && (
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#5B6B7B]">
                {s.label}
              </div>
            )}
            {s.postavke.map((p) => {
              const Ikona = ikona(p.href);
              const aktiven = trenutna?.href === p.href;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`flex items-center gap-2 px-3 py-[5px] text-[12.5px] leading-5 ${
                    aktiven
                      ? "bg-[#E8EEF5] font-semibold text-brand-navy shadow-[inset_3px_0_0_#FF6B1A]"
                      : "text-[#1B2733] hover:bg-[#F3F6F9]"
                  }`}
                >
                  <Ikona size={14} className={aktiven ? "text-brand-navy" : "text-[#5B6B7B]"} />
                  {p.label}
                </Link>
              );
            })}
          </div>
        )
      )}
    </nav>
  );

  const spodaj = [
    imaPot("/admin/tecajniki") ? { href: "/admin/tecajniki", label: "Tečajniki", Ikona: UserRound } : { href: "/admin", label: "Pregled", Ikona: LayoutDashboard },
    imaPot("/admin/prisotnost") ? { href: "/admin/prisotnost", label: "Prisotnost", Ikona: CheckCircle2 } : null,
    imaPot("/admin/placila") ? { href: "/admin/placila", label: "Plačila", Ikona: Euro } : null,
  ];

  return (
    <div data-admin className="erp min-h-screen bg-[#EEF1F5] text-[#1B2733]">
      {/* Zgornja vrstica */}
      <header className="sticky top-0 z-40 flex h-11 items-center gap-2 bg-brand-navy px-2 text-white sm:gap-3 sm:px-3">
        <button onClick={() => setOdprt(true)} aria-label="Odpri meni" className="grid h-9 w-9 place-items-center rounded hover:bg-white/10 lg:hidden">
          <Menu size={19} />
        </button>
        <Link href="/admin" className="flex shrink-0 items-center gap-2 text-[13px] font-bold">
          <span className="h-[18px] w-[18px] rounded bg-brand-orange" aria-hidden="true" />
          <span className="hidden sm:inline">Alpska šola</span>
          <span className="hidden font-normal text-[#AFC0D3] sm:inline">· Admin</span>
        </Link>
        <form onSubmit={isci} role="search" className="flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded bg-[#1A3456] px-2 sm:max-w-md">
          <Search size={13} className="shrink-0 text-[#AFC0D3]" aria-hidden="true" />
          <input
            value={iskanje}
            onChange={(e) => setIskanje(e.target.value)}
            placeholder="Išči otroka, starša, e-pošto …"
            aria-label="Išči tečajnike"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-white placeholder:text-[#AFC0D3] outline-none"
          />
        </form>
        {ima("prijave") && <Link
          href="/admin/prijave/nova"
          className="hidden h-7 shrink-0 items-center gap-1 rounded bg-[#C2410C] px-3 text-[12px] font-semibold text-white hover:bg-[#9A3412] lg:inline-flex"
        >
          <Plus size={13} /> Nova prijava
        </Link>}
        <div className="ml-auto hidden items-center gap-2 text-[12px] text-[#D5DFEA] md:flex">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-orange text-[10px] font-bold text-brand-navy">
            {ime.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <span className="max-w-[120px] truncate">{ime}</span>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" aria-label="Odjava" title="Odjava" className="grid h-7 w-7 place-items-center rounded hover:bg-white/10">
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-44px)]">
        {/* Računalnik: stalni moduli */}
        <aside className="sticky top-11 hidden max-h-[calc(100vh-44px)] w-[200px] shrink-0 self-start overflow-y-auto border-r border-[#DDE3EA] bg-white lg:block">
          {meni}
        </aside>

        <main className="min-w-0 flex-1 px-2 pb-24 pt-3 sm:px-3 lg:px-4 lg:pb-8">{children}</main>
      </div>

      {/* Telefon: predal z vsemi moduli */}
      {odprt && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button aria-label="Zapri meni" className="absolute inset-0 bg-black/50" onClick={() => setOdprt(false)} />
          <aside className="relative flex w-[82%] max-w-[300px] flex-col overflow-y-auto bg-white">
            <div className="flex h-11 items-center justify-between bg-brand-navy px-3 text-white">
              <span className="text-[13px] font-bold">Alpska šola · Admin</span>
              <button onClick={() => setOdprt(false)} aria-label="Zapri" className="grid h-9 w-9 place-items-center rounded hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            {meni}
            <div className="mt-auto border-t border-[#DDE3EA] px-3 py-3 text-[12px]">
              <div className="font-semibold text-brand-navy">{ime}</div>
              <div className="mb-2 text-[11px] text-[#5B6B7B]">{vloga === "admin" ? "Skrbnik" : "Zaposleni"}</div>
              <form action="/api/admin/logout" method="POST">
                <button type="submit" className="inline-flex items-center gap-1.5 text-[#5B6B7B] hover:text-[#C2410C]">
                  <LogOut size={13} /> Odjava
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* Telefon: spodnja vrstica, glavni gumb v sredini */}
      <nav aria-label="Hitri meni" className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 items-center border-t border-[#DDE3EA] bg-white pb-[env(safe-area-inset-bottom)] text-center lg:hidden">
        {[spodaj[0], spodaj[1]].map((p, i) =>
          p ? (
            <Link key={p.href} href={p.href} className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] ${trenutna?.href === p.href ? "font-semibold text-brand-navy" : "text-[#5B6B7B]"}`}>
              <p.Ikona size={18} /> {p.label}
            </Link>
          ) : (
            <span key={i} />
          )
        )}
        <div className="flex justify-center">
          {ima("prijave") && <Link
            href="/admin/prijave/nova"
            className="-mt-7 inline-flex h-[52px] items-center gap-1 whitespace-nowrap rounded-full border-4 border-[#EEF1F5] bg-[#C2410C] px-4 text-[12px] font-bold text-white shadow-lg"
          >
            <Plus size={15} /> Nova prijava
          </Link>}
        </div>
        {spodaj[2] ? (
          <Link href={spodaj[2].href} className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] ${trenutna?.href === spodaj[2].href ? "font-semibold text-brand-navy" : "text-[#5B6B7B]"}`}>
            <Euro size={18} /> {spodaj[2].label}
          </Link>
        ) : (
          <span />
        )}
        <button onClick={() => setOdprt(true)} className="flex h-full flex-col items-center justify-center gap-0.5 text-[10px] text-[#5B6B7B]">
          <Menu size={18} /> Več
        </button>
      </nav>
    </div>
  );
}
