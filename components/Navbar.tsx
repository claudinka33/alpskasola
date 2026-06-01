"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";

const menuItems = [
  { label: "O nas", href: "/o-nas" },
  { label: "Smučanje", href: "/sola-smucanja" },
  { label: "Akademija", href: "/smucarska-akademija" },
  { label: "Tekmovalne ekipe", href: "/ski-racing-team" },
  { label: "Plavanje", href: "/plavalni-tecaj" },
  { label: "Abeceda", href: "/sportna-abeceda" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="https://assets.cdn.filesafe.space/x59KaDfsCMuhMlks5lOI/media/6a1438ede05851175c7a0326.png"
              alt="Alpska šola"
              width={48}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop menu */}
          <nav className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-brand-navy hover:text-brand-orange transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="tel:064230888"
              className="hidden md:flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange transition-colors"
            >
              <Phone size={16} />
              <span className="font-semibold text-brand-navy">064 230 888</span>
            </a>
            <Link
              href="/prijava"
              className="hidden md:inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors shadow-md shadow-brand-orange/20"
            >
              Prijavi se <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-brand-navy"
              aria-label="Meni"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t border-slate-100 py-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-brand-navy hover:bg-orange-50 hover:text-brand-orange rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2 px-4">
                <a
                  href="tel:064230888"
                  className="flex items-center gap-2 py-2 text-sm text-slate-600"
                >
                  <Phone size={16} className="text-brand-orange" />
                  <span className="font-semibold">064 230 888</span>
                </a>
                <Link
                  href="/prijava"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-4 py-3 rounded-lg text-sm font-semibold"
                >
                  Prijavi se <ArrowRight size={16} />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
