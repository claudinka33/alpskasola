"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Loader2,
  Eye,
  EyeOff,
  CalendarDays,
  Cake,
  FileText,
  ArrowRight,
} from "lucide-react";

type Program = {
  id: number;
  slug: string;
  naziv: string;
  na_prijavnici: boolean;
  aktiven: boolean;
};

export default function PrijavnicaPage() {
  const [programi, setProgrami] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [shranjujem, setShranjujem] = useState<string | null>(null);

  const nalozi = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/prijavnica-programi").then((r) => r.json());
      setProgrami(d.programi || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const preklopi = async (p: Program) => {
    setShranjujem(p.slug);
    // optimističen prikaz
    setProgrami((prev) =>
      prev.map((x) => (x.slug === p.slug ? { ...x, na_prijavnici: !x.na_prijavnici } : x))
    );
    try {
      await fetch("/api/prijavnica-programi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: p.slug, na_prijavnici: !p.na_prijavnici }),
      });
    } catch {
      nalozi(); // ob napaki ponastavi
    } finally {
      setShranjujem(null);
    }
  };

  const stViden = programi.filter((p) => p.na_prijavnici).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
          <ClipboardList size={26} className="text-brand-orange" /> Prijavnica
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Tukaj urejaš vse okoli javne prijavnice — kateri programi so na voljo, termini, rojstni dan in oddane prijave.
        </p>
      </div>

      {/* Programi na prijavnici */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Programi na prijavnici</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vklopi programe, ki naj se pokažejo v spustnem meniju „Izberi program“.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {stViden} vidnih
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : programi.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm px-6">
            Ni programov. (Si zagnala SQL migracijo in dodala programe v bazo?)
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {programi.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-3 px-6 py-3.5">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-navy truncate">{p.naziv}</div>
                  <div className="text-[11px] text-slate-400">{p.slug}</div>
                </div>
                <button
                  onClick={() => preklopi(p)}
                  disabled={shranjujem === p.slug}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                    p.na_prijavnici
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {shranjujem === p.slug ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : p.na_prijavnici ? (
                    <Eye size={13} />
                  ) : (
                    <EyeOff size={13} />
                  )}
                  {p.na_prijavnici ? "Na prijavnici" : "Skrit"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bližnjice */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Uredi vsebino prijavnice
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <Bliznjica
          href="/admin/termini"
          icon={CalendarDays}
          naslov="Termini"
          opis="Razpiši termine (npr. plavalni tečaj)."
        />
        <Bliznjica
          href="/admin/rojstni-dan"
          icon={Cake}
          naslov="Rojstni dan"
          opis="Uredi pakete in aktivnosti."
        />
        <Bliznjica
          href="/admin/prijave"
          icon={FileText}
          naslov="Oddane prijave"
          opis="Pregled prijav, statusi, izvoz."
        />
      </div>
    </div>
  );
}

function Bliznjica({
  href,
  icon: Icon,
  naslov,
  opis,
}: {
  href: string;
  icon: any;
  naslov: string;
  opis: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-slate-200/70 p-5 hover:border-brand-orange hover:shadow-sm transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <div className="font-bold text-brand-navy flex items-center gap-1">
        {naslov}
        <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-xs text-slate-500 mt-1">{opis}</p>
    </Link>
  );
}
