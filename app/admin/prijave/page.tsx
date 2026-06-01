"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Download, Plus, Loader2, X, Phone, Mail, Calendar, ChevronDown } from "lucide-react";

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
  ustvarjeno: string;
};

export default function PrijavePage() {
  const [prijave, setPrijave] = useState<Prijava[]>([]);
  const [loading, setLoading] = useState(true);
  const [iskanje, setIskanje] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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
      "ID", "Program", "Otrok ime", "Otrok priimek", "Rojstvo", "Znanje",
      "Starš ime", "Starš priimek", "Email", "Telefon", "Naslov", "Pošta",
      "Opomba", "Status", "Ustvarjeno",
    ];
    const rows = prijave.map((p) => [
      p.id, programLabels[p.program] || p.program, p.otrok_ime, p.otrok_priimek,
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Prijavnice</h1>
          <p className="text-sm text-slate-600">{prijave.length} prijav prikazanih</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={izvoziCsv}
            disabled={prijave.length === 0}
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
        {(iskanje || filterProgram || filterStatus) && (
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : prijave.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">Ni prijav za prikaz.</p>
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
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {prijave.map((p) => {
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
