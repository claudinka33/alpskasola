"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/o-nas", label: "O nas" },
  { href: "/sola-smucanja", label: "Smučanje" },
  { href: "/smucarska-akademija", label: "Akademija" },
  { href: "/ski-racing-team", label: "Tekmovalne ekipe" },
  { href: "/plavalni-tecaj", label: "Plavanje" },
  { href: "/sportna-abeceda", label: "Abeceda" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-24 lg:h-28">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/alpska-logo.png"
              alt="Alpska šola"
              className="h-20 lg:h-24 w-auto"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors"
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

        {open && (
          <div className="lg:hidden border-t border-slate-200 py-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base font-medium text-brand-navy py-2.5 px-2 rounded-lg hover:bg-orange-50"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="tel:064230888"
                className="flex items-center gap-2 text-base font-medium text-brand-navy py-2.5 px-2 mt-2 border-t border-slate-100"
              >
                <Phone size={16} /> 064 230 888
              </a>
              <Link
                href="/prijava"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-5 py-3 rounded-lg text-sm font-bold mt-2"
              >
                Prijavi se <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
