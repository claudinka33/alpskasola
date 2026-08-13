"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Download, Plus, Loader2, X, Phone, Mail, Calendar, ChevronDown, ListChecks, Printer } from "lucide-react";

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

  const izvoziCsv = () => {
    const headers = [
      "ID", "Program", "Termin", "Otrok ime", "Otrok priimek", "Rojstvo", "Znanje",
      "Starš ime", "Starš priimek", "Email", "Telefon", "Naslov", "Pošta",
      "Opomba", "Status", "Ustvarjeno",
    ];
    const rows = prikazane.map((p) => [
      p.id, programLabels[p.program] || p.program, p.termin || "", p.otrok_ime, p.otrok_priimek,
      p.otrok_rojstvo, p.otrok_znanje || "", p.starsi_ime, p.starsi_priimek,
      p.email, p.telefon, p.naslov || "", p.posta || "", p.opomba || "",
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
      </style></head><body>
      <h1>Seznam prijavljenih otrok — ${naslov}</h1>
      <p>${prikazane.length} prijav · natisnjeno ${new Date().toLocaleDateString("sl-SI")}</p>
      <table><thead><tr><th></th><th>Otrok</th><th>Rojstvo</th><th>Starš</th><th>Telefon</th><th>Status</th></tr></thead>
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Prijavnice</h1>
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
            onClick={izvoziCsv}
            disabled={prikazane.length === 0}
            className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-colors disabled:opacity-50"
          >
            <Download size={16} /> Izvozi CSV
          </button>
          <Link
            href="/admin/prijave/nova"
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
          >
            <Plus size={16} /> Nova prijava
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-3">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Otrok</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Program</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Starš</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Kontakt</th>
                  {dodatniStolpci.map((s) => (
                    <th key={s} className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">{s}</th>
                  ))}
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs">
                            {p.otrok_ime[0]}{p.otrok_priimek[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-brand-navy">
                              {p.otrok_ime} {p.otrok_priimek}
                            </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
