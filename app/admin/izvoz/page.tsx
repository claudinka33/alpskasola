"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, FileSpreadsheet } from "lucide-react";

const programLabels: Record<string, string> = {
  "sola-smucanja": "Smučanje",
  "ski-racing-team": "Tekmovalne ekipe",
  "smucarska-akademija": "Akademija",
  "plavalni-tecaj": "Plavanje",
  "sportna-abeceda": "Športna abeceda",
  "sola-rolanja": "Rolanje",
  "praznovanje-rojstnega-dne": "Rojstni dan",
  servis: "Servis",
  "izposoja-opreme": "Izposoja",
};

const statusi = [
  { value: "nova", label: "Nova" },
  { value: "potrjeno", label: "Potrjeno" },
  { value: "placano", label: "Plačano" },
  { value: "koncano", label: "Končano" },
  { value: "preklicano", label: "Preklicano" },
];

type Prijava = {
  id: number;
  program: string;
  otrok_ime: string;
  otrok_priimek: string;
  otrok_rojstvo: string;
  otrok_znanje: string | null;
  starsi_ime: string;
  starsi_priimek: string;
  email: string;
  telefon: string;
  naslov: string | null;
  posta: string | null;
  opomba: string | null;
  status: string;
  ustvarjeno: string;
};

function loadXLSX(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).XLSX) {
      return resolve((window as any).XLSX);
    }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve((window as any).XLSX);
    s.onerror = () => reject(new Error("Nalaganje Excel knjižnice ni uspelo."));
    document.head.appendChild(s);
  });
}

export default function IzvozPage() {
  const [prijave, setPrijave] = useState<Prijava[]>([]);
  const [loading, setLoading] = useState(true);
  const [izvazam, setIzvazam] = useState(false);
  const [napaka, setNapaka] = useState("");
  const [iskanje, setIskanje] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const naloziPrijave = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (iskanje) params.set("iskanje", iskanje);
    if (filterProgram) params.set("program", filterProgram);
    if (filterStatus) params.set("status", filterStatus);
    try {
      const res = await fetch(`/api/prijave?${params.toString()}`);
      const data = await res.json();
      setPrijave(data.prijave || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    naloziPrijave();
  }, []);

  useEffect(() => {
    const t = setTimeout(naloziPrijave, 300);
    return () => clearTimeout(t);
  }, [iskanje, filterProgram, filterStatus]);

  const izvozi = async () => {
    setNapaka("");
    setIzvazam(true);
    try {
      const XLSX = await loadXLSX();
      const data = prijave.map((p) => ({
        ID: p.id,
        Program: programLabels[p.program] || p.program,
        "Otrok ime": p.otrok_ime,
        "Otrok priimek": p.otrok_priimek,
        Rojstvo: p.otrok_rojstvo
          ? new Date(p.otrok_rojstvo).toLocaleDateString("sl-SI")
          : "",
        Znanje: p.otrok_znanje || "",
        "Starš ime": p.starsi_ime,
        "Starš priimek": p.starsi_priimek,
        Email: p.email,
        Telefon: p.telefon,
        Naslov: p.naslov || "",
        "Pošta": p.posta || "",
        "Opomba / alergije": p.opomba || "",
        Status: p.status,
        Ustvarjeno: p.ustvarjeno
          ? new Date(p.ustvarjeno).toLocaleString("sl-SI")
          : "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      ws["!cols"] = [
        { wch: 6 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
        { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 14 },
        { wch: 20 }, { wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 18 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Prijave");
      XLSX.writeFile(wb, `prijave-${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (e: any) {
      setNapaka(e?.message || "Napaka pri izvozu.");
    } finally {
      setIzvazam(false);
    }
  };

  const aktivenFilter = iskanje || filterProgram || filterStatus;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/prijave"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange mb-4"
      >
        <ArrowLeft size={14} /> Nazaj na prijave
      </Link>

      <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Izvoz v Excel</h1>
      <p className="text-sm text-slate-600 mb-6">
        Nastavi filter in prenesi prijave kot Excel datoteko (.xlsx).
      </p>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Išči po imenu, emailu, telefonu..."
          value={iskanje}
          onChange={(e) => setIskanje(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
        />
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-brand-orange outline-none"
        >
          <option value="">Vsi programi</option>
          {Object.entries(programLabels).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-brand-orange outline-none"
        >
          <option value="">Vsi statusi</option>
          {statusi.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {aktivenFilter && (
          <button
            onClick={() => {
              setIskanje("");
              setFilterProgram("");
              setFilterStatus("");
            }}
            className="px-3 py-2.5 text-sm text-slate-600 hover:text-brand-orange"
          >
            Počisti filtre
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-brand-navy">
              {loading ? "…" : prijave.length}
            </div>
            <div className="text-xs text-slate-500">
              {aktivenFilter ? "prijav po filtru" : "vseh prijav"}
            </div>
          </div>
        </div>

        <button
          onClick={izvozi}
          disabled={izvazam || loading || prijave.length === 0}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
        >
          {izvazam ? (
            <><Loader2 size={16} className="animate-spin" /> Pripravljam...</>
          ) : (
            <><Download size={16} /> Prenesi Excel</>
          )}
        </button>
      </div>

      {napaka && (
        <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-lg text-sm">{napaka}</div>
      )}

      <p className="text-xs text-slate-400 mt-4">
        Morebitne alergije so zapisane v stolpcu »Opomba / alergije«.
      </p>
    </div>
  );
}
