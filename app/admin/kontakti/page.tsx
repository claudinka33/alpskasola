"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  Loader2,
  Upload,
  Download,
  Plus,
  Trash2,
  Check,
  X,
  Mail,
} from "lucide-react";

type Kontakt = {
  id: number;
  ime: string | null;
  priimek: string | null;
  email: string;
  telefon: string | null;
  otrok: string | null;
  oznake: string;
  narocen: boolean;
  vir: string | null;
  ustvarjeno: string;
};

// Preprost CSV parser (podpira narekovaje in vejice v poljih)
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"') {
        if (s[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cur += c;
  }
  row.push(cur);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

// Pretvori vrstico Wix/Google izvoza v kontakt
function vrsticaVKontakt(glava: string[], r: string[]) {
  const g = (ime: string) => {
    const idx = glava.findIndex((h) => h.trim().toLowerCase() === ime.toLowerCase());
    return idx >= 0 ? (r[idx] || "").trim() : "";
  };
  const email = g("Email 1") || g("Email") || g("E-mail");
  if (!email) return null;
  // V Wix izvozu je v "First Name" pogosto ime otroka, v "Last Name" pa starš
  const otrok = g("First Name");
  const stars = g("Last Name");
  const deli = stars.split(/\s+/);
  const ime = deli[0] || "";
  const priimek = deli.slice(1).join(" ");
  const oznake = (g("Labels") || "")
    .split(";")
    .map((x) => x.trim())
    .filter((x) => x && !x.toLowerCase().endsWith(".csv"))
    .join(";");
  const narocen = (g("Email subscriber status") || "").toLowerCase() !== "unsubscribed";
  return {
    ime,
    priimek,
    email: email.toLowerCase(),
    telefon: g("Phone 1") || g("Phone"),
    otrok,
    oznake,
    narocen,
    vir: "Uvoz CSV",
  };
}

export default function KontaktiPage() {
  const [kontakti, setKontakti] = useState<Kontakt[]>([]);
  const [loading, setLoading] = useState(true);
  const [iskanje, setIskanje] = useState("");
  const [oznaka, setOznaka] = useState("");
  const [narocen, setNarocen] = useState("");
  const [uvoz, setUvoz] = useState<{ skupaj: number; narejeno: number; preskoceni: number } | null>(null);
  const [novEmail, setNovEmail] = useState("");
  const [novoIme, setNovoIme] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const nalozi = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (iskanje) params.set("iskanje", iskanje);
    if (oznaka) params.set("oznaka", oznaka);
    if (narocen) params.set("narocen", narocen);
    try {
      const d = await fetch(`/api/admin/kontakti?${params}`).then((r) => r.json());
      setKontakti(d.kontakti || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { nalozi(); }, []);
  useEffect(() => {
    const t = setTimeout(nalozi, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iskanje, oznaka, narocen]);

  // Vse oznake za filter
  const vseOznake = Array.from(
    new Set(kontakti.flatMap((k) => k.oznake.split(";").map((o) => o.trim()).filter(Boolean)))
  ).sort();

  const uvoziDatoteko = async (f: File) => {
    const text = await f.text();
    const rows = parseCsv(text);
    if (rows.length < 2) return alert("Datoteka je prazna ali brez glave.");
    const glava = rows[0];
    const zapisi = rows.slice(1).map((r) => vrsticaVKontakt(glava, r)).filter(Boolean);
    setUvoz({ skupaj: zapisi.length, narejeno: 0, preskoceni: rows.length - 1 - zapisi.length });
    for (let i = 0; i < zapisi.length; i += 100) {
      const paket = zapisi.slice(i, i + 100);
      const d = await fetch("/api/admin/kontakti/uvoz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kontakti: paket }),
      }).then((r) => r.json());
      setUvoz((prev) =>
        prev
          ? {
              ...prev,
              narejeno: Math.min(prev.skupaj, i + paket.length),
              preskoceni: prev.preskoceni + (d.preskoceni || 0),
            }
          : prev
      );
    }
    await nalozi();
  };

  const dodajRocno = async () => {
    if (!novEmail.trim()) return;
    const deli = novoIme.trim().split(/\s+/);
    await fetch("/api/admin/kontakti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: novEmail.trim(),
        ime: deli[0] || null,
        priimek: deli.slice(1).join(" ") || null,
      }),
    });
    setNovEmail("");
    setNovoIme("");
    nalozi();
  };

  const izbrisi = async (k: Kontakt) => {
    if (!confirm(`Izbrišem kontakt ${k.email}?`)) return;
    await fetch(`/api/admin/kontakti?id=${k.id}`, { method: "DELETE" });
    nalozi();
  };

  const preklopiNarocen = async (k: Kontakt) => {
    setKontakti((prev) => prev.map((x) => (x.id === k.id ? { ...x, narocen: !k.narocen } : x)));
    await fetch("/api/admin/kontakti", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: k.id, narocen: !k.narocen }),
    });
  };

  const izvozi = () => {
    const headers = ["Ime", "Priimek", "Email", "Telefon", "Otrok", "Oznake", "Naročen", "Vir"];
    const rows = kontakti.map((k) => [
      k.ime || "", k.priimek || "", k.email, k.telefon || "", k.otrok || "",
      k.oznake, k.narocen ? "da" : "ne", k.vir || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kontakti-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steviloNarocenih = kontakti.filter((k) => k.narocen).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2 mb-1">
            <Users size={26} className="text-brand-orange" /> Kontakti
          </h1>
          <p className="text-sm text-slate-600">
            {kontakti.length} kontaktov prikazanih · {steviloNarocenih} naročenih na obvestila
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={izvozi}
            disabled={kontakti.length === 0}
            className="inline-flex items-center gap-2 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 hover:border-slate-300 disabled:opacity-50"
          >
            <Download size={16} /> Izvozi
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark"
          >
            <Upload size={16} /> Uvozi CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uvoziDatoteko(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {uvoz && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm">
          {uvoz.narejeno < uvoz.skupaj ? (
            <span className="flex items-center gap-2 text-blue-900">
              <Loader2 size={15} className="animate-spin" />
              Uvažam: {uvoz.narejeno}/{uvoz.skupaj} kontaktov…
            </span>
          ) : (
            <span className="flex items-center gap-2 text-blue-900">
              <Check size={15} />
              Uvoz končan: {uvoz.skupaj} kontaktov{uvoz.preskoceni > 0 ? ` (${uvoz.preskoceni} preskočenih brez veljavnega emaila)` : ""}.
              <button onClick={() => setUvoz(null)} className="ml-auto text-blue-500 hover:text-blue-800"><X size={15} /></button>
            </span>
          )}
        </div>
      )}

      {/* Filtri */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={iskanje}
            onChange={(e) => setIskanje(e.target.value)}
            placeholder="Išči po imenu, emailu, otroku..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm"
          />
        </div>
        <select value={oznaka} onChange={(e) => setOznaka(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none max-w-[220px]">
          <option value="">Vse oznake</option>
          {vseOznake.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={narocen} onChange={(e) => setNarocen(e.target.value)} className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none">
          <option value="">Vsi</option>
          <option value="true">Samo naročeni</option>
          <option value="false">Odjavljeni</option>
        </select>
      </div>

      {/* Ročni vnos */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-2">Dodaj kontakt:</span>
        <input
          value={novoIme}
          onChange={(e) => setNovoIme(e.target.value)}
          placeholder="Ime in priimek"
          className="flex-1 min-w-[150px] px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
        />
        <input
          value={novEmail}
          onChange={(e) => setNovEmail(e.target.value)}
          placeholder="email@primer.si"
          type="email"
          className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
        />
        <button
          onClick={dodajRocno}
          disabled={!novEmail.trim()}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <Plus size={14} /> Dodaj
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Loader2 size={32} className="animate-spin text-brand-orange mx-auto" /></div>
        ) : kontakti.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Ni kontaktov. Uvozi CSV (Wix izvoz) ali dodaj ročno.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Starš</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Otrok</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Oznake</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Obvestila</th>
                  <th className="px-2"></th>
                </tr>
              </thead>
              <tbody>
                {kontakti.slice(0, 500).map((k) => (
                  <tr key={k.id} className="border-b border-slate-100 hover:bg-orange-50/30">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-brand-navy">{[k.ime, k.priimek].filter(Boolean).join(" ") || "—"}</div>
                      <div className="text-[11px] text-slate-400">{k.telefon || ""}</div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      <a href={`mailto:${k.email}`} className="hover:text-brand-orange inline-flex items-center gap-1">
                        <Mail size={12} /> {k.email}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{k.otrok || ""}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {k.oznake.split(";").map((o) => o.trim()).filter(Boolean).slice(0, 3).map((o) => (
                          <span key={o} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[130px]">{o}</span>
                        ))}
                        {k.oznake.split(";").filter((o) => o.trim()).length > 3 && (
                          <span className="text-[10px] text-slate-400">+{k.oznake.split(";").filter((o) => o.trim()).length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => preklopiNarocen(k)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${k.narocen ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}
                      >
                        {k.narocen ? "NAROČEN" : "ODJAVLJEN"}
                      </button>
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={() => izbrisi(k)} className="text-slate-300 hover:text-red-600"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {kontakti.length > 500 && (
              <div className="px-4 py-3 text-xs text-slate-400 border-t border-slate-100">
                Prikazanih prvih 500 — uporabi iskanje ali filtre za več.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
