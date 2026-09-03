"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Clock, FileSpreadsheet, ChevronDown, ChevronRight } from "lucide-react";

type Skupina = { naziv: string; srecanj: number; minut: number; ure: number };
type PoProgramu = {
  program_slug: string;
  srecanj: number;
  minut: number;
  ure: number;
  skupine: Skupina[];
};
type Ucitelj = { ime: string; srecanj: number; minut: number; ure: number; poProgramih: PoProgramu[] };
type Program = { id: number; slug: string; naziv: string };

const prviVMesecu = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};
const danes = () => new Date().toISOString().slice(0, 10);

export default function UrePage() {
  const [ure, setUre] = useState<Ucitelj[]>([]);
  const [programi, setProgrami] = useState<Program[]>([]);
  const [od, setOd] = useState(prviVMesecu());
  const [doDatum, setDoDatum] = useState(danes());
  const [nalagam, setNalagam] = useState(true);
  const [odprt, setOdprt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/programi")
      .then((r) => r.json())
      .then((d) => setProgrami(d.programi || []));
  }, []);

  const nalozi = async () => {
    setNalagam(true);
    try {
      const q = new URLSearchParams();
      if (od) q.set("od", od);
      if (doDatum) q.set("do", doDatum);
      const d = await fetch(`/api/ure?${q.toString()}`).then((r) => r.json());
      setUre(d.ure || []);
    } finally {
      setNalagam(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, [od, doDatum]);

  const naziv = (slug: string) => programi.find((p) => p.slug === slug)?.naziv || slug;

  const skupajUre = useMemo(() => ure.reduce((s, u) => s + u.minut, 0) / 60, [ure]);
  const skupajVadb = useMemo(() => ure.reduce((s, u) => s + u.srecanj, 0), [ure]);

  const obdobje = (n: "mesec" | "prejsnji" | "sezona") => {
    const d = new Date();
    if (n === "mesec") {
      setOd(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
      setDoDatum(danes());
    } else if (n === "prejsnji") {
      const p = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const zadnji = new Date(d.getFullYear(), d.getMonth(), 0);
      setOd(p.toISOString().slice(0, 10));
      setDoDatum(zadnji.toISOString().slice(0, 10));
    } else {
      const leto = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
      setOd(`${leto}-09-01`);
      setDoDatum(`${leto + 1}-08-31`);
    }
  };

  const izvozi = async () => {
    const XLSX = await new Promise<any>((res, rej) => {
      const w = window as any;
      if (w.XLSX) return res(w.XLSX);
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      sc.onload = () => res((window as any).XLSX);
      sc.onerror = () => rej(new Error("Ni bilo mogoče naložiti knjižnice za Excel."));
      document.head.appendChild(sc);
    }).catch((e) => {
      alert(e.message);
      return null;
    });
    if (!XLSX) return;

    const vrstice: any[] = [];
    for (const u of ure) {
      for (const p of u.poProgramih) {
        for (const sk of p.skupine) {
          vrstice.push({
            Učitelj: u.ime,
            Program: naziv(p.program_slug),
            Skupina: sk.naziv,
            Vadb: sk.srecanj,
            Ur: sk.ure,
          });
        }
      }
      vrstice.push({ Učitelj: u.ime, Program: "SKUPAJ", Skupina: "", Vadb: u.srecanj, Ur: u.ure });
    }
    const ws = XLSX.utils.json_to_sheet(vrstice);
    ws["!cols"] = [{ wch: 26 }, { wch: 22 }, { wch: 38 }, { wch: 8 }, { wch: 8 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ure učiteljev");
    XLSX.writeFile(wb, `ure-uciteljev-${od}-do-${doDatum}.xlsx`);
  };

  const S = "px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2">
            <Clock size={26} className="text-brand-orange" /> Ure učiteljev
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Sešteto iz vseh vadb, čez vse programe. Kdo je bil na vadbi, se označi pri prisotnosti.
          </p>
        </div>
        <button
          onClick={izvozi}
          disabled={ure.length === 0}
          className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-slate-300 disabled:opacity-50"
        >
          <FileSpreadsheet size={16} /> Izvozi Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Od</label>
            <input type="date" value={od} onChange={(e) => setOd(e.target.value)} className={`${S} w-full`} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Do</label>
            <input type="date" value={doDatum} onChange={(e) => setDoDatum(e.target.value)} className={`${S} w-full`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pb-0.5">
          {([
            ["mesec", "Ta mesec"],
            ["prejsnji", "Prejšnji mesec"],
            ["sezona", "Cela sezona"],
          ] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => obdobje(v)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-brand-navy hover:border-brand-orange"
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {ure.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <Kartica label="Učiteljev" vrednost={String(ure.length)} />
          <Kartica label="Vadb skupaj" vrednost={String(skupajVadb)} />
          <Kartica label="Ur skupaj" vrednost={`${skupajUre.toFixed(1)} h`} barva="text-brand-orange" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {nalagam ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : ure.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            V tem obdobju ni vpisanih vadb z učitelji.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {ure.map((u) => {
              const jeOdprt = odprt === u.ime;
              return (
                <li key={u.ime}>
                  <button
                    onClick={() => setOdprt(jeOdprt ? null : u.ime)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 text-left"
                  >
                    {jeOdprt ? (
                      <ChevronDown size={16} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-brand-navy">{u.ime}</div>
                      <div className="text-xs text-slate-500">
                        {u.poProgramih.length} {u.poProgramih.length === 1 ? "program" : "programov"} ·{" "}
                        {u.srecanj} vadb
                      </div>
                    </div>
                    <span className="text-xl font-extrabold text-brand-navy shrink-0">{u.ure} h</span>
                  </button>

                  {jeOdprt && (
                    <div className="px-5 pb-4 pl-12">
                      <div className="space-y-3">
                        {u.poProgramih.map((p) => (
                          <div key={p.program_slug} className="border-t border-slate-100 pt-2">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex-1 font-bold text-brand-navy">
                                {naziv(p.program_slug)}
                              </span>
                              <span className="text-xs text-slate-500 w-20 text-right">
                                {p.srecanj} vadb
                              </span>
                              <span className="font-bold text-brand-navy w-20 text-right">{p.ure} h</span>
                            </div>
                            <ul className="mt-1">
                              {p.skupine.map((sk) => (
                                <li
                                  key={sk.naziv}
                                  className="flex items-center gap-3 text-xs text-slate-600 py-1 pl-4"
                                >
                                  <span className="flex-1 truncate">{sk.naziv}</span>
                                  <span className="w-20 text-right text-slate-400">{sk.srecanj} vadb</span>
                                  <span className="w-20 text-right font-semibold text-slate-700">
                                    {sk.ure} h
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Kartica({
  label,
  vrednost,
  barva = "text-brand-navy",
}: {
  label: string;
  vrednost: string;
  barva?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${barva}`}>{vrednost}</div>
    </div>
  );
}
