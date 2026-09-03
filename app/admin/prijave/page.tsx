"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Download, Plus, Loader2, X, Phone, Mail, Calendar, ChevronDown, ListChecks, Printer, Trash2, FileSpreadsheet } from "lucide-react";

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
  { value: "nova", label: "Nova", bg: "bg-amber-100", text: "text-amber-800" },
  { value: "potrjeno", label: "Potrjeno", bg: "bg-blue-100", text: "text-blue-800" },
  { value: "placano", label: "Plačano", bg: "bg-green-100", text: "text-green-800" },
  { value: "koncano", label: "Končano", bg: "bg-slate-100", text: "text-slate-700" },
  { value: "preklicano", label: "Preklicano", bg: "bg-red-100", text: "text-red-800" },
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
  termin: string | null;
  cena: number | null;
  dodatno: Record<string, string> | null;
  ustvarjeno: string;
};

export default function PrijavePage() {
  const [prijave, setPrijave] = useState<Prijava[]>([]);
  const [loading, setLoading] = useState(true);
  const [iskanje, setIskanje] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTermin, setFilterTermin] = useState("");
  const [seznamPogled, setSeznamPogled] = useState(false);
  const [izbrana, setIzbrana] = useState<Prijava | null>(null);
  const [vsePrijave, setVsePrijave] = useState<Prijava[]>([]);
  const [izbrani, setIzbrani] = useState<number[]>([]);
  const [brisem, setBrisem] = useState(false);

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
    // Vse prijave (brez filtrov) — za oznako "že bil pri nas"
    fetch("/api/prijave")
      .then((r) => r.json())
      .then((d) => setVsePrijave(d.prijave || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(naloziPrijave, 300);
    return () => clearTimeout(t);
  }, [iskanje, filterProgram, filterStatus]);

  const posodobiStatus = async (id: number, status: string) => {
    await fetch(`/api/prijave/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    naloziPrijave();
    if (izbrana?.id === id) {
      setIzbrana({ ...izbrana, status });
    }
  };

  const preklopiIzbiro = (id: number) =>
    setIzbrani((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const izbrisiPrijave = async (ids: number[]) => {
    if (ids.length === 0) return;
    const besedilo =
      ids.length === 1
        ? "Izbrišem to prijavnico? Tega ni mogoče razveljaviti."
        : `Izbrišem ${ids.length} prijavnic? Tega ni mogoče razveljaviti.`;
    if (!confirm(besedilo)) return;
    setBrisem(true);
    try {
      for (const id of ids) {
        await fetch(`/api/prijave/${id}`, { method: "DELETE" });
      }
      setIzbrani([]);
      setIzbrana(null);
      await naloziPrijave();
      const d = await fetch("/api/prijave").then((r) => r.json());
      setVsePrijave(d.prijave || []);
    } finally {
      setBrisem(false);
    }
  };

  // Naloži SheetJS ob prvem izvozu (brez dodatne odvisnosti v projektu)
  const naloziXlsx = () =>
    new Promise<any>((res, rej) => {
      const w = window as any;
      if (w.XLSX) return res(w.XLSX);
      const sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      sc.onload = () => res((window as any).XLSX);
      sc.onerror = () => rej(new Error("Ni bilo mogoče naložiti knjižnice za Excel."));
      document.head.appendChild(sc);
    });

  const izvoziExcel = async () => {
    try {
      const XLSX = await naloziXlsx();
      const vrstice = prikazane.map((p) => ({
        Otrok: `${p.otrok_ime} ${p.otrok_priimek}`,
        Rojstvo: p.otrok_rojstvo ? new Date(p.otrok_rojstvo).toLocaleDateString("sl-SI") : "",
        Program: programLabels[p.program] || p.program,
        Termin: p.termin || "",
        Predznanje: p.otrok_znanje || "",
        Starš: `${p.starsi_ime} ${p.starsi_priimek}`,
        Telefon: p.telefon,
        Email: p.email,
        Naslov: [p.naslov, p.posta].filter(Boolean).join(", "),
        Opomba: p.opomba || "",
        "Že bil pri nas": zeBil(p).join(", "),
        Status: statusi.find((s) => s.value === p.status)?.label || p.status,
        Oddano: new Date(p.ustvarjeno).toLocaleDateString("sl-SI"),
      }));
      const ws = XLSX.utils.json_to_sheet(vrstice);
      ws["!cols"] = [
        { wch: 22 }, { wch: 12 }, { wch: 18 }, { wch: 28 }, { wch: 16 },
        { wch: 22 }, { wch: 14 }, { wch: 28 }, { wch: 26 }, { wch: 40 },
        { wch: 20 }, { wch: 12 }, { wch: 12 },
      ];
      ws["!autofilter"] = { ref: XLSX.utils.encode_range(XLSX.utils.decode_range(ws["!ref"])) };
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Prijavnice");
      const ime = [
        "prijavnice",
        filterProgram ? (programLabels[filterProgram] || filterProgram) : null,
        new Date().toISOString().split("T")[0],
      ]
        .filter(Boolean)
        .join("-")
        .replace(/\s+/g, "_");
      XLSX.writeFile(wb, `${ime}.xlsx`);
    } catch (e: any) {
      alert(e.message || "Izvoz ni uspel.");
    }
  };

  const izvoziCsv = () => {
    const headers = [
      "ID", "Program", "Termin", "Otrok ime", "Otrok priimek", "Rojstvo", "Znanje",
      "Starš ime", "Starš priimek", "Email", "Telefon", "Naslov", "Pošta",
      "Opomba", "Že bil pri nas", "Status", "Ustvarjeno",
    ];
    const rows = prikazane.map((p) => [
      p.id, programLabels[p.program] || p.program, p.termin || "", p.otrok_ime, p.otrok_priimek,
      p.otrok_rojstvo, p.otrok_znanje || "", p.starsi_ime, p.starsi_priimek,
      p.email, p.telefon, p.naslov || "", p.posta || "", p.opomba || "",
      zeBil(p).join(", "),
      p.status, new Date(p.ustvarjeno).toLocaleString("sl-SI"),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prijave-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusConfig = (s: string) => statusi.find((x) => x.value === s) || statusi[0];

  // Zgodovina po otroku (ime + priimek, ne po staršu) — kje vse je že bil.
  const kljucOtroka = (p: { otrok_ime: string; otrok_priimek: string }) =>
    `${p.otrok_ime} ${p.otrok_priimek}`.toLowerCase().replace(/\s+/g, " ").trim();

  const zgodovina = useMemo(() => {
    const m: Record<string, Set<string>> = {};
    for (const p of vsePrijave) {
      const k = kljucOtroka(p);
      if (!m[k]) m[k] = new Set();
      m[k].add(p.program);
    }
    return m;
  }, [vsePrijave]);

  // Programi, na katerih je otrok že bil (razen tekočega)
  const zeBil = (p: Prijava) => {
    const vsi = zgodovina[kljucOtroka(p)];
    if (!vsi) return [] as string[];
    return Array.from(vsi)
      .filter((x) => x !== p.program)
      .map((x) => programLabels[x] || x);
  };

  // Dodatni stolpci: ko je izbran program, pokaži polja po meri (npr. alergije),
  // ki se pojavijo v prijavah tega programa
  const dodatniStolpci = filterProgram
    ? Array.from(new Set(prijave.flatMap((p) => Object.keys(p.dodatno || {})))).slice(0, 4)
    : [];

  // Termini, ki se pojavijo v naloženih prijavah (za filter)
  const terminMoznosti = Array.from(
    new Set(prijave.map((p) => p.termin).filter(Boolean))
  ) as string[];

  // Prikazane prijave = strežniški filtri + filter po terminu (lokalno)
  const prikazane = filterTermin
    ? prijave.filter((p) => p.termin === filterTermin)
    : prijave;

  const natisniSeznam = () => {
    const naslov = [
      filterProgram ? programLabels[filterProgram] || filterProgram : "Vsi programi",
      filterTermin || null,
    ]
      .filter(Boolean)
      .join(" — ");
    const vrstice = prikazane
      .map(
        (p, i) =>
          `<tr>
            <td>${i + 1}.</td>
            <td><strong>${p.otrok_ime} ${p.otrok_priimek}</strong></td>
            <td>${p.otrok_rojstvo ? new Date(p.otrok_rojstvo).toLocaleDateString("sl-SI") : ""}</td>
            <td>${p.starsi_ime} ${p.starsi_priimek}</td>
            <td>${p.telefon}</td>
            <td class="opomba">${(p.opomba || "").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</td>
            <td class="ze">${zeBil(p).join(", ")}</td>
            <td>${(statusi.find((s) => s.value === p.status)?.label || p.status).toUpperCase()}</td>
          </tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Seznam prijav</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px;color:#0C2340}
        h1{font-size:18px;margin:0 0 4px} p{margin:0 0 16px;color:#64748b;font-size:12px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e2e8f0}
        th{font-size:11px;text-transform:uppercase;color:#64748b}
        td.opomba{font-size:11px;color:#334155;max-width:260px}
        td.ze{font-size:11px;color:#9a3412;white-space:nowrap}
      </style></head><body>
      <h1>Seznam prijavljenih otrok — ${naslov}</h1>
      <p>${prikazane.length} prijav · natisnjeno ${new Date().toLocaleDateString("sl-SI")}</p>
      <table><thead><tr><th></th><th>Otrok</th><th>Rojstvo</th><th>Starš</th><th>Telefon</th><th>Opomba</th><th>Že bil pri nas</th><th>Status</th></tr></thead>
      <tbody>${vrstice}</tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-1">Prijavnice</h1>
          <p className="text-sm text-slate-600">{prikazane.length} prijav prikazanih</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSeznamPogled((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
              seznamPogled
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-brand-navy border-slate-200 hover:border-slate-300"
            }`}
          >
            <ListChecks size={16} /> Seznam otrok
          </button>
          <button
            onClick={natisniSeznam}
            disabled={prikazane.length === 0}
            className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-slate-300 disabled:opacity-50"
          >
            <Printer size={16} /> Natisni
          </button>
          <button
            onClick={izvoziExcel}
            disabled={prikazane.length === 0}
            className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={16} /> Izvozi Excel
          </button>
          <button
            onClick={izvoziCsv}
            disabled={prikazane.length === 0}
            title="Izvoz v CSV"
            className="inline-flex items-center gap-2 bg-white text-slate-500 px-3 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
          </button>
          {izbrani.length > 0 && (
            <button
              onClick={() => izbrisiPrijave(izbrani)}
              disabled={brisem}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={16} /> Izbriši izbrane ({izbrani.length})
            </button>
          )}
          <Link
            href="/admin/prijave/nova"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
          >
            <Plus size={16} /> Nova prijava
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Išči po imenu, emailu, telefonu..."
            value={iskanje}
            onChange={(e) => setIskanje(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
          />
        </div>
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
        <select
          value={filterTermin}
          onChange={(e) => setFilterTermin(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:border-brand-orange outline-none max-w-[260px]"
        >
          <option value="">Vsi termini</option>
          {terminMoznosti.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {(iskanje || filterProgram || filterStatus || filterTermin) && (
          <button
            onClick={() => {
              setIskanje("");
              setFilterProgram("");
              setFilterStatus("");
              setFilterTermin("");
            }}
            className="px-3 py-2.5 text-sm text-slate-600 hover:text-brand-orange"
          >
            Počisti filtre
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : prikazane.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">Ni prijav za prikaz.</p>
          </div>
        ) : seznamPogled ? (
          <div className="p-6">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
              {[
                filterProgram ? programLabels[filterProgram] || filterProgram : "Vsi programi",
                filterTermin || null,
              ].filter(Boolean).join(" — ")}{" "}
              · {prikazane.length} otrok
            </div>
            <ol className="space-y-2">
              {prikazane.map((p, i) => {
                const c = getStatusConfig(p.status);
                return (
                  <li
                    key={p.id}
                    onClick={() => setIzbrana(p)}
                    className="flex items-center gap-3 bg-slate-50 hover:bg-orange-50/50 rounded-xl px-4 py-3 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-400 w-7 shrink-0">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-brand-navy">
                        {p.otrok_ime} {p.otrok_priimek}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        {p.otrok_rojstvo ? new Date(p.otrok_rojstvo).toLocaleDateString("sl-SI") : ""}
                      </span>
                      {!filterTermin && p.termin && (
                        <span className="text-xs text-slate-400 ml-2 truncate">· {p.termin}</span>
                      )}
                      {zeBil(p).length > 0 && (
                        <span className="text-[10px] font-bold text-orange-800 bg-orange-100 rounded-full px-2 py-0.5 ml-2">
                          Že bil: {zeBil(p).join(", ")}
                        </span>
                      )}
                      {p.opomba && (
                        <div className="text-xs text-slate-600 whitespace-pre-line mt-1">{p.opomba}</div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 hidden sm:block">
                      {p.starsi_ime} {p.starsi_priimek} · {p.telefon}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${c.bg} ${c.text}`}>
                      {c.label.toUpperCase()}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <>
          {/* Telefon: kartice */}
          <ul className="md:hidden divide-y divide-slate-100">
            {prikazane.map((p) => {
              const c = getStatusConfig(p.status);
              return (
                <li key={p.id} className="p-4 flex gap-3">
                  <input
                    type="checkbox"
                    checked={izbrani.includes(p.id)}
                    onChange={() => preklopiIzbiro(p.id)}
                    className="w-5 h-5 accent-brand-orange shrink-0 mt-0.5"
                  />
                  <button onClick={() => setIzbrana(p)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-brand-navy">
                        {p.otrok_ime} {p.otrok_priimek}
                      </span>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                        {c.label.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {programLabels[p.program] || p.program}
                      {p.termin ? ` · ${p.termin}` : ""}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {p.starsi_ime} {p.starsi_priimek} · {p.telefon}
                    </div>
                    {zeBil(p).length > 0 && (
                      <div className="text-[10px] font-bold text-orange-800 bg-orange-100 rounded-full px-2 py-0.5 inline-block mt-1.5">
                        Že bil: {zeBil(p).join(", ")}
                      </div>
                    )}
                    {p.opomba && (
                      <div className="text-xs text-slate-600 mt-1.5 whitespace-pre-line line-clamp-3">
                        {p.opomba}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Računalnik: tabela */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={prikazane.length > 0 && izbrani.length === prikazane.length}
                      onChange={(e) => setIzbrani(e.target.checked ? prikazane.map((p) => p.id) : [])}
                      className="w-4 h-4 accent-brand-orange"
                      title="Izberi vse prikazane"
                    />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Otrok</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Program</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Starš</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Kontakt</th>
                  {dodatniStolpci.map((s) => (
                    <th key={s} className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">{s}</th>
                  ))}
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Opomba</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {prikazane.map((p) => {
                  const c = getStatusConfig(p.status);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setIzbrana(p)}
                      className="border-b border-slate-100 hover:bg-orange-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={izbrani.includes(p.id)}
                          onChange={() => preklopiIzbiro(p.id)}
                          className="w-4 h-4 accent-brand-orange"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs">
                            {p.otrok_ime[0]}{p.otrok_priimek[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-brand-navy">
                              {p.otrok_ime} {p.otrok_priimek}
                            </div>
                            {zeBil(p).length > 0 && (
                              <div className="text-[10px] font-bold text-orange-800 bg-orange-100 rounded-full px-2 py-0.5 inline-block mt-0.5">
                                Že bil: {zeBil(p).join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {programLabels[p.program] || p.program}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {p.starsi_ime} {p.starsi_priimek}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {p.telefon}
                      </td>
                      {dodatniStolpci.map((s) => (
                        <td key={s} className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">
                          {(p.dodatno || {})[s] || ""}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-slate-600 text-xs max-w-[260px]">
                        {p.opomba ? (
                          <span className="line-clamp-3 whitespace-pre-line">{p.opomba}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {new Date(p.ustvarjeno).toLocaleDateString("sl-SI")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.bg} ${c.text}`}>
                          {c.label.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {izbrana && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setIzbrana(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-brand-navy">
                  {izbrana.otrok_ime} {izbrana.otrok_priimek}
                </h2>
                <p className="text-xs text-slate-500">
                  {programLabels[izbrana.program] || izbrana.program} · #{izbrana.id}
                </p>
              </div>
              <button
                onClick={() => setIzbrana(null)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusi.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => posodobiStatus(izbrana.id, s.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                        izbrana.status === s.value
                          ? `${s.bg} ${s.text} ring-2 ring-offset-1 ring-current`
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {s.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Otrok */}
              <div>
                <h3 className="text-sm font-bold text-brand-navy mb-2">Otrok</h3>
                <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Ime in priimek</span>
                    <strong className="text-brand-navy">{izbrana.otrok_ime} {izbrana.otrok_priimek}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Rojstvo</span>
                    <strong className="text-brand-navy">
                      {new Date(izbrana.otrok_rojstvo).toLocaleDateString("sl-SI")}
                    </strong>
                  </div>
                  {izbrana.otrok_znanje && (
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500 block">Predznanje</span>
                      <strong className="text-brand-navy">{izbrana.otrok_znanje}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Starš */}
              <div>
                <h3 className="text-sm font-bold text-brand-navy mb-2">Starš</h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                  <div>
                    <strong className="text-brand-navy">{izbrana.starsi_ime} {izbrana.starsi_priimek}</strong>
                  </div>
                  <a href={`tel:${izbrana.telefon}`} className="flex items-center gap-2 text-brand-orange hover:underline">
                    <Phone size={14} /> {izbrana.telefon}
                  </a>
                  <a href={`mailto:${izbrana.email}`} className="flex items-center gap-2 text-brand-orange hover:underline">
                    <Mail size={14} /> {izbrana.email}
                  </a>
                  {(izbrana.naslov || izbrana.posta) && (
                    <div className="text-slate-600 text-xs pt-2 border-t border-slate-200">
                      {izbrana.naslov} {izbrana.posta && `, ${izbrana.posta}`}
                    </div>
                  )}
                </div>
              </div>

              {/* Dodatna polja */}
              {izbrana.dodatno && Object.keys(izbrana.dodatno).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-brand-navy mb-2">Dodatna polja</h3>
                  <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(izbrana.dodatno).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-xs text-slate-500 block">{k}</span>
                        <strong className="text-brand-navy">{v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opomba */}
              {izbrana.opomba && (
                <div>
                  <h3 className="text-sm font-bold text-brand-navy mb-2">Opomba</h3>
                  <div className="bg-amber-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap">
                    {izbrana.opomba}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400 pt-3 border-t border-slate-100">
                <Calendar size={12} className="inline mr-1" />
                Prijava ustvarjena: {new Date(izbrana.ustvarjeno).toLocaleString("sl-SI")}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => izbrisiPrijave([izbrana.id])}
                  disabled={brisem}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={15} /> Izbriši to prijavnico
                </button>
                <p className="text-xs text-slate-400 mt-1">
                  Pobriše tudi njena plačila in zapise prisotnosti.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
