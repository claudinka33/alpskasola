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
  Pencil,
  AlertTriangle,
  Wand2,
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

// ---------------------------------------------------------------------------
// Zaznava tipkarskih napak v emailih
// ---------------------------------------------------------------------------
const DOMENE_POPRAVKI: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmail.como": "gmail.com",
  "g.mail.com": "gmail.com",
  "gmail.si": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "siol.ne": "siol.net",
  "siol.nte": "siol.net",
  "sioll.net": "siol.net",
  "siol.net.si": "siol.net",
  "t-2.ne": "t-2.net",
  "telemach.ne": "telemach.net",
  "amis.ne": "amis.net",
};

// Vrne predlagan popravek ali null, če je email videti v redu
function predlogEmaila(email: string): string | null {
  const e = (email || "").trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1 || at === e.length - 1) return null;

  const local = e.slice(0, at);
  let dom = e.slice(at + 1);

  if (DOMENE_POPRAVKI[dom]) {
    dom = DOMENE_POPRAVKI[dom];
  } else {
    dom = dom
      .replace(/\.com[a-z]{1,2}$/, ".com") // gmail.comsl → gmail.com
      .replace(/\.net[a-z]{1,2}$/, ".net") // siol.netsi → siol.net
      .replace(/\.con$/, ".com")
      .replace(/\.cm$/, ".com")
      .replace(/\.comn$/, ".com");
  }

  const popravljen = `${local}@${dom}`;
  return popravljen !== e ? popravljen : null;
}

// Osnovna veljavnost
function veljavenEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((e || "").trim());
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  const s = text.replace(/^\uFEFF/, "");
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

function vrsticaVKontakt(glava: string[], r: string[]) {
  const g = (ime: string) => {
    const idx = glava.findIndex((h) => h.trim().toLowerCase() === ime.toLowerCase());
    return idx >= 0 ? (r[idx] || "").trim() : "";
  };
  const email = g("Email 1") || g("Email") || g("E-mail");
  if (!email) return null;
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

// ---------------------------------------------------------------------------
export default function KontaktiPage() {
  const [kontakti, setKontakti] = useState<Kontakt[]>([]);
  const [loading, setLoading] = useState(true);
  const [iskanje, setIskanje] = useState("");
  const [oznaka, setOznaka] = useState("");
  const [narocen, setNarocen] = useState("");
  const [samoSumljivi, setSamoSumljivi] = useState(false);
  const [uvoz, setUvoz] = useState<{ skupaj: number; narejeno: number; preskoceni: number } | null>(null);
  const [novEmail, setNovEmail] = useState("");
  const [novoIme, setNovoIme] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // urejanje
  const [urejam, setUrejam] = useState<number | null>(null);
  const [osnutek, setOsnutek] = useState<Partial<Kontakt>>({});
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState("");

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

  const vseOznake = Array.from(
    new Set(kontakti.flatMap((k) => k.oznake.split(";").map((o) => o.trim()).filter(Boolean)))
  ).sort();

  const jeSumljiv = (k: Kontakt) => !veljavenEmail(k.email) || predlogEmaila(k.email) !== null;
  const steviloSumljivih = kontakti.filter(jeSumljiv).length;
  const prikazani = samoSumljivi ? kontakti.filter(jeSumljiv) : kontakti;

  // -------------------------------------------------------------------------
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

  // --- urejanje -------------------------------------------------------------
  const zacniUrejanje = (k: Kontakt) => {
    setNapaka("");
    setUrejam(k.id);
    setOsnutek({
      ime: k.ime || "",
      priimek: k.priimek || "",
      email: k.email,
      telefon: k.telefon || "",
      otrok: k.otrok || "",
      oznake: k.oznake || "",
      narocen: k.narocen,
    });
  };

  const preklici = () => {
    setUrejam(null);
    setOsnutek({});
    setNapaka("");
  };

  const shrani = async () => {
    if (urejam === null) return;
    const email = String(osnutek.email || "").trim().toLowerCase();
    if (!veljavenEmail(email)) {
      setNapaka("Email ni veljaven.");
      return;
    }
    setShranjujem(true);
    setNapaka("");
    try {
      const res = await fetch("/api/admin/kontakti", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: urejam,
          ime: osnutek.ime ?? "",
          priimek: osnutek.priimek ?? "",
          email,
          telefon: osnutek.telefon ?? "",
          otrok: osnutek.otrok ?? "",
          oznake: osnutek.oznake ?? "",
          narocen: !!osnutek.narocen,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setNapaka(d.error || "Napaka pri shranjevanju.");
        return;
      }
      setKontakti((prev) =>
        prev.map((x) => (x.id === urejam ? { ...x, ...(d.kontakt || {}) } : x))
      );
      setUrejam(null);
      setOsnutek({});
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setShranjujem(false);
    }
  };

  // Hitri popravek emaila brez odpiranja urejanja
  const hitriPopravek = async (k: Kontakt) => {
    const predlog = predlogEmaila(k.email);
    if (!predlog) return;
    if (!confirm(`Popravim ${k.email} → ${predlog}?`)) return;
    const res = await fetch("/api/admin/kontakti", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: k.id, email: predlog }),
    });
    const d = await res.json();
    if (!res.ok) {
      alert(d.error || "Napaka pri popravku.");
      return;
    }
    setKontakti((prev) => prev.map((x) => (x.id === k.id ? { ...x, ...(d.kontakt || {}) } : x)));
  };

  const izvozi = () => {
    const headers = ["Ime", "Priimek", "Email", "Telefon", "Otrok", "Oznake", "Naročen", "Vir"];
    const rows = prikazani.map((k) => [
      k.ime || "", k.priimek || "", k.email, k.telefon || "", k.otrok || "",
      k.oznake, k.narocen ? "da" : "ne", k.vir || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kontakti-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steviloNarocenih = kontakti.filter((k) => k.narocen).length;

  const vnos =
    "w-full px-2 py-1.5 rounded-md border border-brand-orange/40 focus:border-brand-orange outline-none text-sm bg-white";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2 mb-1">
            <Users size={26} className="text-brand-orange" /> Kontakti
          </h1>
          <p className="text-sm text-slate-600">
            {kontakti.length} kontaktov prikazanih · {steviloNarocenih} naročenih na obvestila
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={izvozi}
            disabled={prikazani.length === 0}
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
        <button
          onClick={() => setSamoSumljivi((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
            samoSumljivi
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-amber-700 border-amber-300 hover:bg-amber-50"
          }`}
        >
          <AlertTriangle size={15} />
          Sumljivi emaili ({steviloSumljivih})
        </button>
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
        ) : prikazani.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            {samoSumljivi ? "Ni sumljivih emailov. 🎉" : "Ni kontaktov. Uvozi CSV (Wix izvoz) ali dodaj ročno."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Starš</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Otrok</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Oznake</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase tracking-wider">Obvestila</th>
                  <th className="px-2 w-[70px]"></th>
                </tr>
              </thead>
              <tbody>
                {prikazani.slice(0, 500).map((k) => {
                  const predlog = predlogEmaila(k.email);
                  const neveljaven = !veljavenEmail(k.email);

                  if (urejam === k.id) {
                    return (
                      <tr key={k.id} className="border-b border-slate-100 bg-orange-50/50 align-top">
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <input
                              value={osnutek.ime ?? ""}
                              onChange={(e) => setOsnutek((o) => ({ ...o, ime: e.target.value }))}
                              placeholder="Ime"
                              className={vnos}
                            />
                            <input
                              value={osnutek.priimek ?? ""}
                              onChange={(e) => setOsnutek((o) => ({ ...o, priimek: e.target.value }))}
                              placeholder="Priimek"
                              className={vnos}
                            />
                            <input
                              value={osnutek.telefon ?? ""}
                              onChange={(e) => setOsnutek((o) => ({ ...o, telefon: e.target.value }))}
                              placeholder="Telefon"
                              className={vnos}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={osnutek.email ?? ""}
                            onChange={(e) => setOsnutek((o) => ({ ...o, email: e.target.value }))}
                            placeholder="email@primer.si"
                            type="email"
                            className={vnos}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") shrani();
                              if (e.key === "Escape") preklici();
                            }}
                          />
                          {predlogEmaila(String(osnutek.email || "")) && (
                            <button
                              onClick={() =>
                                setOsnutek((o) => ({
                                  ...o,
                                  email: predlogEmaila(String(o.email || "")) || o.email,
                                }))
                              }
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900"
                            >
                              <Wand2 size={11} />
                              Uporabi: {predlogEmaila(String(osnutek.email || ""))}
                            </button>
                          )}
                          {napaka && (
                            <div className="mt-1.5 text-[11px] font-semibold text-red-600">{napaka}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={osnutek.otrok ?? ""}
                            onChange={(e) => setOsnutek((o) => ({ ...o, otrok: e.target.value }))}
                            placeholder="Ime otroka"
                            className={vnos}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={osnutek.oznake ?? ""}
                            onChange={(e) => setOsnutek((o) => ({ ...o, oznake: e.target.value }))}
                            placeholder="oznaka1;oznaka2"
                            className={vnos}
                          />
                          <div className="text-[10px] text-slate-400 mt-1">Ločuj s podpičjem ;</div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setOsnutek((o) => ({ ...o, narocen: !o.narocen }))}
                            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                              osnutek.narocen ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {osnutek.narocen ? "NAROČEN" : "ODJAVLJEN"}
                          </button>
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={shrani}
                              disabled={shranjujem}
                              title="Shrani"
                              className="p-1.5 rounded-md bg-brand-orange text-white hover:bg-brand-orange-dark disabled:opacity-50"
                            >
                              {shranjujem ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={preklici}
                              title="Prekliči"
                              className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-800"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={k.id}
                      className={`border-b border-slate-100 hover:bg-orange-50/30 ${
                        neveljaven || predlog ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-brand-navy">{[k.ime, k.priimek].filter(Boolean).join(" ") || "—"}</div>
                        <div className="text-[11px] text-slate-400">{k.telefon || ""}</div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">
                        <a href={`mailto:${k.email}`} className="hover:text-brand-orange inline-flex items-center gap-1">
                          <Mail size={12} /> {k.email}
                        </a>
                        {(predlog || neveljaven) && (
                          <div className="mt-1">
                            {predlog ? (
                              <button
                                onClick={() => hitriPopravek(k)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded hover:bg-amber-200"
                              >
                                <Wand2 size={11} /> Popravi → {predlog}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                <AlertTriangle size={11} /> Neveljaven email
                              </span>
                            )}
                          </div>
                        )}
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => zacniUrejanje(k)}
                            title="Uredi"
                            className="text-slate-300 hover:text-brand-orange"
                          >
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => izbrisi(k)} title="Izbriši" className="text-slate-300 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {prikazani.length > 500 && (
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
