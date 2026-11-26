"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, ArrowRight, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/o-nas", label: "O nas" },
  {
    label: "Programi",
    dropdown: [
      { href: "/sola-smucanja", label: "⛷️ Alpska šola smučanja" },
      { href: "/tecaj-bordanja", label: "🏂 Alpska šola bordanja" },
      { href: "/mini-alpska-sola", label: "🎿 Mini alpska šola" },
      { href: "/smucarska-akademija", label: "🎓 Akademija" },
      { href: "/ski-racing-team", label: "🏆 Tekmovalne ekipe" },
      { href: "/plavalni-tecaj", label: "🏊 Plavalni tečaj" },
      { href: "/sportna-abeceda", label: "🤸 Športna abeceda" },
      { href: "/sola-rolanja", label: "🛼 Rolanje" },
      { href: "/praznovanje-rojstnega-dne", label: "🎂 Rojstni dan" },
    ],
  },
  { href: "/servis", label: "Servis" },
  { href: "/izposoja-opreme", label: "Izposoja" },
];

// Programi v vrstici pod glavo: zima | vse leto | dogodki
const PROGRAMI_SKUPINE: { href: string; label: string }[][] = [
  [
    { href: "/sola-smucanja", label: "Alpska šola smučanja" },
    { href: "/tecaj-bordanja", label: "Alpska šola bordanja" },
    { href: "/mini-alpska-sola", label: "Mini alpska šola" },
  ],
  [
    { href: "/smucarska-akademija", label: "Akademija" },
    { href: "/ski-racing-team", label: "Tekmovalne ekipe" },
    { href: "/plavalni-tecaj", label: "Plavalni tečaj" },
    { href: "/sportna-abeceda", label: "Športna abeceda" },
    { href: "/sola-rolanja", label: "Rolanje" },
  ],
  [{ href: "/praznovanje-rojstnega-dne", label: "Rojstni dan" }],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pot = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/alpska-logo.png"
              alt="Alpska šola"
              className="h-16 lg:h-20 w-auto"
            />
          </Link>

          {/* Desktop meni */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks
              .filter((l) => !l.dropdown)
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={`text-sm font-medium transition-colors hover:text-brand-orange ${
                    pot === link.href ? "text-brand-orange" : "text-brand-navy"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:064230888"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange"
            >
              <Phone size={14} />
              <strong className="text-brand-navy">064 230 888</strong>
            </a>
            <Link
              href="/prijava"
              className="inline-flex items-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
            >
              Prijavi se <ArrowRight size={14} />
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-brand-navy"
            aria-label="Meni"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Vsi programi v vrstici (računalnik) — na telefonu so v meniju */}
        <div className="hidden lg:flex border-t border-slate-200/70 -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-wrap items-center justify-center gap-y-1 gap-x-1 mx-auto py-1.5 whitespace-nowrap">
            {PROGRAMI_SKUPINE.map((sk, si) => (
              <div key={si} className="flex items-center gap-1">
                {si > 0 && <span className="w-px h-4 bg-slate-200 mx-1 xl:mx-2" aria-hidden />}
                {sk.map((p) => {
                  const aktiven = pot === p.href;
                  return (
                    <Link
                      key={p.href}
                      href={p.href}
                      className={`px-2 xl:px-3 py-1.5 rounded-full text-[12.5px] xl:text-[13px] font-semibold transition-colors ${
                        aktiven
                          ? "bg-brand-orange text-white"
                          : "text-brand-navy hover:bg-orange-50 hover:text-brand-orange"
                      }`}
                    >
                      {p.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col gap-1">
              <Link href="/o-nas" onClick={() => setOpen(false)} className="text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">O nas</Link>
              <div className="border-t border-slate-100 pt-2 mt-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">Programi</div>
                <Link href="/sola-smucanja" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">⛷️ Alpska šola smučanja</Link>
                <Link href="/tecaj-bordanja" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🏂 Alpska šola bordanja</Link>
                <Link href="/mini-alpska-sola" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🎿 Mini alpska šola</Link>
                <Link href="/smucarska-akademija" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🎓 Akademija</Link>
                <Link href="/ski-racing-team" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🏆 Tekmovalne ekipe</Link>
                <Link href="/plavalni-tecaj" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🏊 Plavalni tečaj</Link>
                <Link href="/sportna-abeceda" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🤸 Športna abeceda</Link>
                <Link href="/sola-rolanja" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🛼 Rolanje</Link>
                <Link href="/praznovanje-rojstnega-dne" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">🎂 Rojstni dan</Link>
              </div>
              <div className="border-t border-slate-100 pt-2 mt-1">
                <Link href="/servis" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">Servis</Link>
                <Link href="/izposoja-opreme" onClick={() => setOpen(false)} className="block text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50">Izposoja</Link>
              </div>
              <a href="tel:064230888" className="flex items-center gap-2 text-base font-medium text-brand-navy py-2.5 px-2 mt-2 border-t border-slate-100">
                <Phone size={16} /> 064 230 888
              </a>
              <Link href="/prijava" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-5 py-3 rounded-lg text-sm font-bold mt-2">
                Prijavi se <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
