"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, Trash2, Copy, FileText, ImageIcon, HardDrive, Check } from "lucide-react";

type Datoteka = {
  id: number;
  ime: string;
  tip: string;
  velikost: number;
  ustvarjeno: string;
};

const MEJA = 0.5 * 1024 * 1024 * 1024; // 0,5 GB

const velikost = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;

export default function DatotekePage() {
  const [datoteke, setDatoteke] = useState<Datoteka[]>([]);
  const [poraba, setPoraba] = useState({ skupaj: 0, stevilo: 0 });
  const [nalagam, setNalagam] = useState(false);
  const [berem, setBerem] = useState(true);
  const [kopirano, setKopirano] = useState<number | null>(null);

  const nalozi = async () => {
    setBerem(true);
    try {
      const d = await fetch("/api/datoteke").then((r) => r.json());
      setDatoteke(d.datoteke || []);
      setPoraba(d.poraba || { skupaj: 0, stevilo: 0 });
    } finally {
      setBerem(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const dodaj = async (files: FileList) => {
    setNalagam(true);
    try {
      for (const f of Array.from(files)) {
        const fd = new FormData();
        fd.append("datoteka", f);
        const r = await fetch("/api/datoteke", { method: "POST", body: fd });
        if (!r.ok) {
          const d = await r.json();
          alert(`${f.name}: ${d.error || "nalaganje ni uspelo"}`);
        }
      }
      await nalozi();
    } finally {
      setNalagam(false);
    }
  };

  const izbrisi = async (d: Datoteka) => {
    if (!confirm(`Izbrišem "${d.ime}"? Če je uporabljena v že poslanem emailu, se tam ne bo več prikazala.`))
      return;
    await fetch(`/api/datoteke?id=${d.id}`, { method: "DELETE" });
    nalozi();
  };

  const kopiraj = (d: Datoteka) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/datoteke/${d.id}`);
    setKopirano(d.id);
    setTimeout(() => setKopirano(null), 2000);
  };

  const odstotek = Math.min(100, (poraba.skupaj / MEJA) * 100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
          <HardDrive size={26} className="text-brand-orange" /> Datoteke
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Slike in dokumenti za uporabo v emailih. Naloži jih tu, nato jih v Emailingu samo izbereš.
        </p>
      </div>

      {/* Poraba */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-5 mb-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-semibold text-brand-navy">
            {poraba.stevilo} {poraba.stevilo === 1 ? "datoteka" : "datotek"} · {velikost(poraba.skupaj)}
          </span>
          <span className="text-slate-500">od 500 MB</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              odstotek > 80 ? "bg-red-500" : odstotek > 50 ? "bg-amber-500" : "bg-green-500"
            }`}
            style={{ width: `${Math.max(2, odstotek)}%` }}
          />
        </div>
        {odstotek > 80 && (
          <p className="text-xs text-red-600 mt-2 font-semibold">
            Prostora je malo. Izbriši stare datoteke, ki jih ne rabiš več.
          </p>
        )}
      </div>

      {/* Nalaganje */}
      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-2xl py-10 mb-6 cursor-pointer hover:border-brand-orange hover:bg-orange-50/30 transition-colors">
        {nalagam ? (
          <>
            <Loader2 size={24} className="animate-spin text-brand-orange" />
            <span className="text-sm font-semibold text-slate-500">Nalagam...</span>
          </>
        ) : (
          <>
            <Upload size={24} className="text-brand-orange" />
            <span className="text-sm font-bold text-brand-navy">Naloži slike ali PDF</span>
            <span className="text-xs text-slate-400">
              Lahko izbereš več naenkrat. Največ 4 MB na datoteko.
            </span>
          </>
        )}
        <input
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) dodaj(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {berem ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
        </div>
      ) : datoteke.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 py-16 text-center text-sm text-slate-400">
          Še ni naloženih datotek.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {datoteke.map((d) => {
            const jeSlika = d.tip.startsWith("image/");
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
                <a
                  href={`/api/datoteke/${d.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-36 bg-slate-50 flex items-center justify-center overflow-hidden"
                >
                  {jeSlika ? (
                    <img src={`/api/datoteke/${d.id}`} alt={d.ime} className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={40} className="text-slate-300" />
                  )}
                </a>
                <div className="p-4">
                  <div className="flex items-start gap-2 mb-1">
                    {jeSlika ? (
                      <ImageIcon size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    ) : (
                      <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-sm font-semibold text-brand-navy break-all leading-snug">
                      {d.ime}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">
                    {velikost(d.velikost)} · {new Date(d.ustvarjeno).toLocaleDateString("sl-SI")}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => kopiraj(d)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-brand-navy hover:border-brand-orange"
                    >
                      {kopirano === d.id ? (
                        <>
                          <Check size={13} className="text-green-600" /> Kopirano
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Kopiraj naslov
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => izbrisi(d)}
                      className="p-2 text-slate-300 hover:text-red-600"
                      title="Izbriši"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
