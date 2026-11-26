"use client";

// Zavihki modula »Prijavnica« — vse, kar določa, kaj starši vidijo in dobijo ob prijavi, na enem mestu.
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ClipboardList } from "lucide-react";

const ZAVIHKI = [
  { href: "/admin/prijavnica", label: "Programi" },
  { href: "/admin/prijavnica?zavihek=polja", label: "Polja prijavnice" },
  { href: "/admin/termini", label: "Termini" },
  { href: "/admin/rojstni-dan", label: "Rojstni dan" },
  { href: "/admin/email", label: "Potrditveni e-mail" },
];

function Vrstica() {
  const pot = usePathname();
  const sp = useSearchParams();
  const zdaj = pot + (sp.get("zavihek") ? `?zavihek=${sp.get("zavihek")}` : "");
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardList size={16} className="text-brand-orange" />
        <span className="text-[15px] font-bold text-brand-navy">Prijavnica</span>
        <span className="hidden text-[12px] text-[#5B6B7B] sm:inline">— kaj starši vidijo na prijavnici in kaj prejmejo po oddaji</span>
      </div>
      <nav aria-label="Zavihki prijavnice" className="-mx-2 flex overflow-x-auto border-b border-[#DDE3EA] px-2 sm:mx-0 sm:px-0">
        {ZAVIHKI.map((z) => {
          const aktiven = zdaj === z.href;
          return (
            <Link
              key={z.href}
              href={z.href}
              aria-current={aktiven ? "page" : undefined}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[12.5px] ${
                aktiven ? "border-brand-orange font-semibold text-brand-navy" : "border-transparent text-[#5B6B7B] hover:text-brand-navy"
              }`}
            >
              {z.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function PrijavnicaZavihki() {
  return (
    <Suspense fallback={<div className="mb-3 h-[70px]" />}>
      <Vrstica />
    </Suspense>
  );
}
