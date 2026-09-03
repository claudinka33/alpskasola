"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Send,
  Loader2,
  Mail,
  Check,
  AlertCircle,
  FlaskConical,
  Users,
  Type,
  Image as ImageIcon,
  CalendarDays,
  MousePointerClick,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  Save,
  Copy,
  FileText,
  Trash2,
} from "lucide-react";

type Predloga = {
  id: number;
  naziv: string;
  zadeva: string;
  naslov: string | null;
  vsebina: string;
  bloki: string | null;
  ustvarjeno: string;
};

type Kampanja = {
  id: number;
  zadeva: string;
  naslov: string | null;
  bloki?: string | null;
  vsebina: string;
  filter_opis: string | null;
  prejemniki_st: number;
  poslano_st: number;
  status: string;
  ustvarjeno: string;
};

type Kontakt = { id: number; email: string; oznake: string; narocen: boolean };

type Termin = {
  id: number;
  program_slug: string;
  naziv: string;
  lokacija: string | null;
  datum_od: string | null;
  datum_do: string | null;
  cena: number | null;
  status: string;
  aktiven: boolean;
};

// --- Bloki ------------------------------------------------------------------

type Blok =
  | { kljuc: string; tip: "besedilo"; besedilo: string }
  | { kljuc: string; tip: "slika"; url: string }
  | { kljuc: string; tip: "termin"; terminId: number | null }
  | { kljuc: string; tip: "gumb"; napis: string; url: string };

const novKljuc = () => Math.random().toString(36).slice(2, 10);

function formatirajDatum(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function terminObdobje(t: Termin) {
  const od = formatirajDatum(t.datum_od);
  const doo = formatirajDatum(t.datum_do);
  if (od && doo) return `${od} – ${doo}`;
  return od || doo || "";
}

// Blok -> vrstice, ki jih razume lib/email.ts
function blokVBesedilo(b: Blok, termini: Termin[]): string {
  if (b.tip === "besedilo") return b.besedilo.trim();

  if (b.tip === "slika") return b.url.trim() ? `SLIKA: ${b.url.trim()}` : "";

  if (b.tip === "gumb") {
    if (!b.napis.trim() || !b.url.trim()) return "";
    return `GUMB: ${b.napis.trim()} | ${b.url.trim()}`;
  }

  const t = termini.find((x) => x.id === b.terminId);
  if (!t) return "";
  const vrstice = ["PODATKI:"];
  const obdobje = terminObdobje(t);
  if (obdobje) vrstice.push(`Termin: ${obdobje}`);
  if (t.lokacija) vrstice.push(`Lokacija: ${t.lokacija}`);
  if (t.cena != null) vrstice.push(`Cena: ${t.cena} €`);
  if (vrstice.length === 1) return "";
  return vrstice.join("\n");
}

function blokiVVsebino(bloki: Blok[], termini: Termin[]) {
  return bloki
    .map((b) => blokVBesedilo(b, termini))
    .filter((s) => s.length > 0)
    .join("\n\n");
}

// Ali kontakt ustreza vsaj eni izmed izbranih oznak
function ustrezaOznakam(k: Kontakt, oznake: string[]) {
  if (oznake.length === 0) return true;
  const moje = k.oznake.toLowerCase();
  return oznake.some((o) => moje.includes(o.toLowerCase()));
}

export default function KampanjePage() {
  const [zadeva, setZadeva] = useState("");
  const [naslov, setNaslov] = useState("");
  const [bloki, setBloki] = useState<Blok[]>([
    { kljuc: novKljuc(), tip: "besedilo", besedilo: "" },
  ]);
  const [oznake, setOznake] = useState<string[]>([]);
  const [iskanjeOznak, setIskanjeOznak] = useState("");
  const [samoNaroceni, setSamoNaroceni] = useState(true);
  const [kontakti, setKontakti] = useState<Kontakt[]>([]);
  const [termini, setTermini] = useState<Termin[]>([]);
  const [kampanje, setKampanje] = useState<Kampanja[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [testStanje, setTestStanje] = useState<"" | "posiljam" | "poslano" | "napaka">("");
  const [posiljanje, setPosiljanje] = useState<{ skupaj: number; poslano: number } | null>(null);
  const [napaka, setNapaka] = useState("");
  const [predloge, setPredloge] = useState<Predloga[]>([]);
  const [shraniPredlogoOdprt, setShraniPredlogoOdprt] = useState(false);
  const [nazivPredloge, setNazivPredloge] = useState("");

  const vsebina = blokiVVsebino(bloki, termini);

  const naloziKontakte = async () => {
    try {
      const d = await fetch("/api/admin/kontakti").then((r) => r.json());
      setKontakti(d.kontakti || []);
    } catch {}
  };
  const naloziPredloge = async () => {
    try {
      const d = await fetch("/api/predloge").then((r) => r.json());
      setPredloge(d.predloge || []);
    } catch {}
  };

  // Naloži blokovni zapis v urejevalnik (iz predloge ali pretekle kampanje)
  const uporabi = (vir: { zadeva: string; naslov: string | null; bloki: string | null }) => {
    setZadeva(vir.zadeva || "");
    setNaslov(vir.naslov || "");
    if (vir.bloki) {
      try {
        const b = JSON.parse(vir.bloki) as Blok[];
        if (Array.isArray(b) && b.length > 0) {
          setBloki(b.map((x) => ({ ...x, kljuc: novKljuc() })));
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      } catch {}
    }
    alert("Ta kampanja nima shranjenih blokov, prenesla sem samo zadevo in naslov.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shraniPredlogo = async () => {
    const naziv = nazivPredloge.trim();
    if (!naziv) return;
    await fetch("/api/predloge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naziv, zadeva, naslov, vsebina, bloki: JSON.stringify(bloki) }),
    });
    setNazivPredloge("");
    setShraniPredlogoOdprt(false);
    naloziPredloge();
  };

  const izbrisiPredlogo = async (id: number, naziv: string) => {
    if (!confirm(`Izbrišem predlogo "${naziv}"?`)) return;
    await fetch(`/api/predloge?id=${id}`, { method: "DELETE" });
    naloziPredloge();
  };

  const naloziKampanje = async () => {
    try {
      const d = await fetch("/api/admin/kampanje").then((r) => r.json());
      setKampanje(d.kampanje || []);
    } catch {}
  };
  const naloziTermine = async () => {
    try {
      const d = await fetch("/api/termini").then((r) => r.json());
      setTermini(d.termini || []);
    } catch {}
  };

  useEffect(() => {
    naloziKontakte();
    naloziKampanje();
    naloziTermine();
    naloziPredloge();
  }, []);

  const vseOznake = useMemo(
    () =>
      Array.from(
        new Set(kontakti.flatMap((k) => k.oznake.split(";").map((o) => o.trim()).filter(Boolean)))
      ).sort((a, b) => a.localeCompare(b, "sl")),
    [kontakti]
  );

  // Koliko naročenih kontaktov ima posamezno oznako (za prikaz ob checkboxu)
  const stevecOznak = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of vseOznake) {
      m[o] = kontakti.filter(
        (k) => (!samoNaroceni || k.narocen) && k.oznake.toLowerCase().includes(o.toLowerCase())
      ).length;
    }
    return m;
  }, [vseOznake, kontakti, samoNaroceni]);

  // Prejemniki — unikatni po emailu (če je isti starš v več oznakah, dobi mail enkrat)
  const prejemnikiPreview = useMemo(() => {
    const videni = new Set<string>();
    const rezultat: Kontakt[] = [];
    for (const k of kontakti) {
      if (samoNaroceni && !k.narocen) continue;
      if (!ustrezaOznakam(k, oznake)) continue;
      const e = String(k.email || "").trim().toLowerCase();
      if (!e || videni.has(e)) continue;
      videni.add(e);
      rezultat.push(k);
    }
    return rezultat;
  }, [kontakti, oznake, samoNaroceni]);

  // Koliko prejemnikov je bilo odštetih zaradi podvajanja med oznakami
  const podvojeni = useMemo(() => {
    if (oznake.length < 2) return 0;
    const vsota = oznake.reduce((s, o) => s + (stevecOznak[o] || 0), 0);
    return Math.max(0, vsota - prejemnikiPreview.length);
  }, [oznake, stevecOznak, prejemnikiPreview.length]);

  const prikazaneOznake = vseOznake.filter((o) =>
    o.toLowerCase().includes(iskanjeOznak.toLowerCase())
  );

  const preklopiOznako = (o: string) => {
    setOznake((prej) => (prej.includes(o) ? prej.filter((x) => x !== o) : [...prej, o]));
  };

  // --- Upravljanje blokov ---
  const dodajBlok = (tip: Blok["tip"]) => {
    const osnova = { kljuc: novKljuc() };
    const nov: Blok =
      tip === "besedilo"
        ? { ...osnova, tip: "besedilo", besedilo: "" }
        : tip === "slika"
        ? { ...osnova, tip: "slika", url: "" }
        : tip === "termin"
        ? { ...osnova, tip: "termin", terminId: null }
        : { ...osnova, tip: "gumb", napis: "Prijavi otroka", url: "https://www.alpskasola.com/prijava" };
    setBloki((prej) => [...prej, nov]);
  };

  const posodobiBlok = (kljuc: string, sprememba: Partial<Blok>) => {
    setBloki((prej) => prej.map((b) => (b.kljuc === kljuc ? ({ ...b, ...sprememba } as Blok) : b)));
  };

  const odstraniBlok = (kljuc: string) => {
    setBloki((prej) => prej.filter((b) => b.kljuc !== kljuc));
  };

  const premakniBlok = (indeks: number, smer: -1 | 1) => {
    setBloki((prej) => {
      const cilj = indeks + smer;
      if (cilj < 0 || cilj >= prej.length) return prej;
      const kopija = [...prej];
      const [vzeto] = kopija.splice(indeks, 1);
      kopija.splice(cilj, 0, vzeto);
      return kopija;
    });
  };

  // --- Pošiljanje ---
  const posljiTest = async () => {
    if (!testEmail.trim() || !zadeva || !vsebina) return;
    setTestStanje("posiljam");
    try {
      const res = await fetch("/api/admin/kampanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zadeva, naslov, vsebina, testEmail: testEmail.trim() }),
      });
      setTestStanje(res.ok ? "poslano" : "napaka");
    } catch {
      setTestStanje("napaka");
    }
    setTimeout(() => setTestStanje(""), 3000);
  };

  const poslji = async () => {
    setNapaka("");
    if (!zadeva || !vsebina) return setNapaka("Vpiši zadevo in vsaj en blok z vsebino.");
    if (prejemnikiPreview.length === 0) return setNapaka("Ni prejemnikov za izbrane filtre.");
    const opisOznak = oznake.length === 0 ? "vse kontakte" : `oznake: ${oznake.join(" + ")}`;
    if (!confirm(`Pošljem email "${zadeva}" na ${prejemnikiPreview.length} naslovov (${opisOznak})?`)) return;

    try {
      const res = await fetch("/api/admin/kampanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zadeva, naslov, vsebina, oznake, samoNaroceni, bloki: JSON.stringify(bloki) }),
      });
      const d = await res.json();
      if (!res.ok) return setNapaka(d.error || "Napaka pri ustvarjanju kampanje.");

      const prejemniki: string[] = d.prejemniki || [];
      const kampanjaId = d.kampanja.id;
      setPosiljanje({ skupaj: prejemniki.length, poslano: 0 });

      let poslanoDoslej = 0;
      for (let i = 0; i < prejemniki.length; i += 50) {
        const paket = prejemniki.slice(i, i + 50);
        const koncanoPaket = i + 50 >= prejemniki.length;
        const r = await fetch("/api/admin/kampanje/poslji", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kampanjaId, zadeva, naslov, vsebina, prejemniki: paket, poslanoDoslej, koncano: koncanoPaket }),
        });
        const rd = await r.json();
        if (!r.ok) {
          setNapaka(`Napaka med pošiljanjem (poslano ${poslanoDoslej}): ${rd.error || ""}`);
          break;
        }
        poslanoDoslej = rd.skupaj;
        setPosiljanje({ skupaj: prejemniki.length, poslano: poslanoDoslej });
        await new Promise((res2) => setTimeout(res2, 700));
      }
      naloziKampanje();
    } catch (e: any) {
      setNapaka("Napaka pri povezavi.");
    }
  };

  const koncano = posiljanje && posiljanje.poslano >= posiljanje.skupaj;

  const gumbDodaj =
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-white text-brand-navy hover:border-brand-orange hover:text-brand-orange transition-colors";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2 mb-1">
          <Send size={26} className="text-brand-orange" /> Emailing
        </h1>
        <p className="text-sm text-slate-600">
          Sestavi email iz blokov — besedilo, slika, termin, gumb. Predogled desno kaže, kako bo videti pri staršu.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Sestavljanje */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1.5">Zadeva emaila *</label>
              <input
                value={zadeva}
                onChange={(e) => setZadeva(e.target.value)}
                placeholder="npr. Plavalni tečaj Terme Zreče, 31. 8.–4. 9."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1.5">Naslov v emailu</label>
              <input
                value={naslov}
                onChange={(e) => setNaslov(e.target.value)}
                placeholder="npr. Plavalni tečaj v Termah Zreče"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm focus:border-brand-orange"
              />
            </div>

            {/* Gumbi za dodajanje blokov */}
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-brand-navy mb-2">Vsebina *</label>
              <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={() => dodajBlok("besedilo")} className={gumbDodaj}>
                  <Type size={14} /> Besedilo
                </button>
                <button type="button" onClick={() => dodajBlok("slika")} className={gumbDodaj}>
                  <ImageIcon size={14} /> Slika
                </button>
                <button type="button" onClick={() => dodajBlok("termin")} className={gumbDodaj}>
                  <CalendarDays size={14} /> Termin
                </button>
                <button type="button" onClick={() => dodajBlok("gumb")} className={gumbDodaj}>
                  <MousePointerClick size={14} /> Gumb
                </button>
              </div>

              {bloki.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl">
                  Ni blokov. Dodaj prvega z gumbi zgoraj.
                </p>
              )}

              <div className="space-y-3">
                {bloki.map((b, i) => (
                  <div key={b.kljuc} className="border border-slate-200 rounded-xl bg-slate-50/60">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {b.tip === "besedilo" ? "Besedilo" : b.tip === "slika" ? "Slika" : b.tip === "termin" ? "Termin" : "Gumb"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => premakniBlok(i, -1)}
                          disabled={i === 0}
                          className="p-1.5 text-slate-400 hover:text-brand-navy disabled:opacity-30"
                          title="Premakni gor"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => premakniBlok(i, 1)}
                          disabled={i === bloki.length - 1}
                          className="p-1.5 text-slate-400 hover:text-brand-navy disabled:opacity-30"
                          title="Premakni dol"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => odstraniBlok(b.kljuc)}
                          className="p-1.5 text-slate-400 hover:text-red-600"
                          title="Odstrani"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3">
                      {b.tip === "besedilo" && (
                        <textarea
                          value={b.besedilo}
                          onChange={(e) => posodobiBlok(b.kljuc, { besedilo: e.target.value } as any)}
                          rows={5}
                          placeholder="Napiši odstavek..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm resize-y bg-white focus:border-brand-orange"
                        />
                      )}

                      {b.tip === "slika" && (
                        <>
                          <input
                            value={b.url}
                            onChange={(e) => posodobiBlok(b.kljuc, { url: e.target.value } as any)}
                            placeholder="https://www.alpskasola.com/plavanje.jpg"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm bg-white focus:border-brand-orange"
                          />
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            Fotografijo naloži v mapo <strong>public/</strong> na GitHubu, nato tu vpiši naslov
                            https://www.alpskasola.com/ime-datoteke.jpg
                          </p>
                        </>
                      )}

                      {b.tip === "termin" && (
                        <>
                          <select
                            value={b.terminId ?? ""}
                            onChange={(e) =>
                              posodobiBlok(b.kljuc, { terminId: e.target.value ? parseInt(e.target.value) : null } as any)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange"
                          >
                            <option value="">— izberi termin —</option>
                            {termini.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.naziv}
                                {t.lokacija ? ` · ${t.lokacija}` : ""}
                                {terminObdobje(t) ? ` · ${terminObdobje(t)}` : ""}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-slate-400 mt-1.5">
                            Datum, lokacija in cena se izpišejo samodejno iz termina.
                          </p>
                        </>
                      )}

                      {b.tip === "gumb" && (
                        <div className="grid sm:grid-cols-2 gap-2">
                          <input
                            value={b.napis}
                            onChange={(e) => posodobiBlok(b.kljuc, { napis: e.target.value } as any)}
                            placeholder="Napis na gumbu"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm bg-white focus:border-brand-orange"
                          />
                          <input
                            value={b.url}
                            onChange={(e) => posodobiBlok(b.kljuc, { url: e.target.value } as any)}
                            placeholder="https://www.alpskasola.com/prijava"
                            className="px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm bg-white focus:border-brand-orange"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test */}
            <div className="flex flex-wrap gap-2 items-center border-t border-slate-100 pt-4">
              <FlaskConical size={16} className="text-slate-400" />
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tvoj@email.si za testni email"
                type="email"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
              />
              <button
                onClick={posljiTest}
                disabled={testStanje === "posiljam" || !testEmail.trim() || !zadeva || !vsebina}
                className="inline-flex items-center gap-1.5 bg-white text-brand-navy border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:border-slate-300"
              >
                {testStanje === "posiljam" ? <Loader2 size={14} className="animate-spin" /> : testStanje === "poslano" ? <Check size={14} className="text-green-600" /> : <Mail size={14} />}
                {testStanje === "poslano" ? "Poslano!" : "Pošlji test"}
              </button>
            </div>
          </div>

          {napaka && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-4 rounded-xl text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {napaka}
            </div>
          )}

          {posiljanje && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <strong className="text-brand-navy">{koncano ? "✅ Poslano!" : "Pošiljam..."}</strong>
                <span className="text-slate-500">{posiljanje.poslano}/{posiljanje.skupaj}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange transition-all"
                  style={{ width: `${posiljanje.skupaj ? (posiljanje.poslano / posiljanje.skupaj) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* PREDOGLED */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Predogled (kako vidi starš)
            </div>
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 text-center">
                  <img src="/alpska-logo.png" alt="Alpska šola" className="h-10 w-auto inline-block" />
                </div>
                <div className="px-6 py-6">
                  {naslov && (
                    <div className="text-lg font-extrabold text-brand-navy mb-3">{naslov}</div>
                  )}
                  {bloki.map((b) => {
                    if (b.tip === "besedilo") {
                      return b.besedilo.trim() ? (
                        <p key={b.kljuc} className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-4">
                          {b.besedilo}
                        </p>
                      ) : null;
                    }
                    if (b.tip === "slika") {
                      return b.url.trim() ? (
                        <img
                          key={b.kljuc}
                          src={b.url}
                          alt=""
                          className="w-full rounded-xl mb-4"
                        />
                      ) : null;
                    }
                    if (b.tip === "termin") {
                      const t = termini.find((x) => x.id === b.terminId);
                      if (!t) return null;
                      return (
                        <div key={b.kljuc} className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                          <table className="w-full text-xs">
                            <tbody>
                              {terminObdobje(t) && (
                                <tr>
                                  <td className="py-1.5 text-slate-500 w-2/5">Termin</td>
                                  <td className="py-1.5 font-semibold text-brand-navy">{terminObdobje(t)}</td>
                                </tr>
                              )}
                              {t.lokacija && (
                                <tr>
                                  <td className="py-1.5 text-slate-500">Lokacija</td>
                                  <td className="py-1.5 font-semibold text-brand-navy">{t.lokacija}</td>
                                </tr>
                              )}
                              {t.cena != null && (
                                <tr>
                                  <td className="py-1.5 text-slate-500">Cena</td>
                                  <td className="py-1.5 font-semibold text-brand-navy">{t.cena} €</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    return b.napis.trim() && b.url.trim() ? (
                      <div key={b.kljuc} className="mb-4">
                        <span className="inline-block bg-brand-orange text-white px-6 py-3 rounded-lg text-sm font-bold">
                          {b.napis}
                        </span>
                      </div>
                    ) : null;
                  })}
                  <p className="text-[10px] text-slate-400 mt-6">
                    Ta email ste prejeli, ker ste del Alpske šole. <u>Odjava od obvestil</u>
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed">
                  Alpska šola · Tepanje 60 · 064 230 888
                  <br />
                  <span className="text-brand-orange font-semibold">www.alpskasola.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prejemniki + pošlji */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
            <h2 className="text-sm font-bold text-brand-navy mb-3 flex items-center gap-2">
              <Users size={16} className="text-brand-orange" /> Prejemniki
            </h2>

            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-500">
                Oznake / programi
              </label>
              {oznake.length > 0 && (
                <button
                  onClick={() => setOznake([])}
                  className="text-[11px] font-semibold text-brand-orange hover:underline"
                >
                  Počisti izbiro
                </button>
              )}
            </div>

            {/* Izbrane oznake */}
            {oznake.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {oznake.map((o) => (
                  <span
                    key={o}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-orange-100 text-orange-800 pl-2 pr-1 py-1 rounded-full"
                  >
                    <span className="truncate max-w-[150px]">{o}</span>
                    <button onClick={() => preklopiOznako(o)} className="hover:text-orange-950">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Iskanje po oznakah */}
            {vseOznake.length > 8 && (
              <div className="relative mb-2">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={iskanjeOznak}
                  onChange={(e) => setIskanjeOznak(e.target.value)}
                  placeholder="Išči oznako…"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-brand-orange"
                />
              </div>
            )}

            {/* Seznam s kljukicami */}
            <div className="border border-slate-200 rounded-xl max-h-[260px] overflow-y-auto mb-3 divide-y divide-slate-100">
              <label className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={oznake.length === 0}
                  onChange={() => setOznake([])}
                  className="w-4 h-4 accent-brand-orange shrink-0"
                />
                <span className="text-sm font-semibold text-brand-navy">Vsi kontakti</span>
              </label>

              {prikazaneOznake.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-400">Ni zadetkov.</div>
              ) : (
                prikazaneOznake.map((o) => (
                  <label
                    key={o}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-orange-50/40"
                  >
                    <input
                      type="checkbox"
                      checked={oznake.includes(o)}
                      onChange={() => preklopiOznako(o)}
                      className="w-4 h-4 accent-brand-orange shrink-0"
                    />
                    <span className="text-xs text-slate-700 flex-1 truncate" title={o}>{o}</span>
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      {stevecOznak[o] ?? 0}
                    </span>
                  </label>
                ))
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={samoNaroceni}
                onChange={(e) => setSamoNaroceni(e.target.checked)}
                className="w-4 h-4 accent-brand-orange"
              />
              Samo naročeni na obvestila
            </label>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center mb-4">
              <div className="text-3xl font-extrabold text-brand-navy">{prejemnikiPreview.length}</div>
              <div className="text-xs text-slate-600">
                {oznake.length === 0
                  ? "prejemnikov (vsi kontakti)"
                  : `prejemnikov iz ${oznake.length} ${oznake.length === 1 ? "oznake" : "oznak"}`}
              </div>
              {podvojeni > 0 && (
                <div className="text-[11px] text-slate-500 mt-1.5">
                  {podvojeni} podvojenih naslovov odštetih — vsak dobi email samo enkrat.
                </div>
              )}
            </div>

            <button
              onClick={poslji}
              disabled={!zadeva || !vsebina || prejemnikiPreview.length === 0 || (posiljanje !== null && !koncano)}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-brand-orange-dark"
            >
              <Send size={16} /> Pošlji vsem ({prejemnikiPreview.length})
            </button>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Najprej si pošlji testni email, da preveriš videz. Pošiljanje poteka v paketih — ne zapiraj strani, dokler ni končano.
            </p>
          </div>

          {/* Predloge */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                <FileText size={15} className="text-brand-orange" /> Predloge
              </h2>
              <button
                onClick={() => setShraniPredlogoOdprt((v) => !v)}
                disabled={!zadeva && !vsebina}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange disabled:opacity-40"
              >
                <Save size={13} /> Shrani to
              </button>
            </div>

            {shraniPredlogoOdprt && (
              <div className="flex gap-2 mb-3">
                <input
                  value={nazivPredloge}
                  onChange={(e) => setNazivPredloge(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && shraniPredlogo()}
                  placeholder="Ime predloge, npr. Plavalni tečaj – info"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-brand-orange"
                />
                <button
                  onClick={shraniPredlogo}
                  className="px-3 py-2 rounded-lg bg-brand-navy text-white text-xs font-bold"
                >
                  Shrani
                </button>
              </div>
            )}

            {predloge.length === 0 ? (
              <p className="text-xs text-slate-400">
                Še ni predlog. Napiši mail in ga shrani, da ga naslednjič samo odpreš.
              </p>
            ) : (
              <ul className="space-y-2">
                {predloge.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => uporabi({ zadeva: p.zadeva, naslov: p.naslov, bloki: p.bloki })}
                      className="flex-1 text-left min-w-0 hover:text-brand-orange"
                    >
                      <span className="font-semibold text-brand-navy block truncate">{p.naziv}</span>
                      <span className="text-[11px] text-slate-400 block truncate">{p.zadeva}</span>
                    </button>
                    <button
                      onClick={() => izbrisiPredlogo(p.id, p.naziv)}
                      className="shrink-0 p-1.5 text-slate-300 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Zgodovina */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
            <h2 className="text-sm font-bold text-brand-navy mb-3">Zadnje kampanje</h2>
            {kampanje.length === 0 ? (
              <p className="text-xs text-slate-400">Še ni poslanih kampanj.</p>
            ) : (
              <ul className="space-y-3">
                {kampanje.slice(0, 8).map((k) => (
                  <li key={k.id} className="text-sm border-b border-slate-100 pb-2 last:border-0 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-brand-navy truncate">{k.zadeva}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(k.ustvarjeno).toLocaleDateString("sl-SI")} · {k.poslano_st}/{k.prejemniki_st} poslanih
                        {k.filter_opis ? ` · ${k.filter_opis}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => uporabi({ zadeva: k.zadeva, naslov: k.naslov, bloki: k.bloki || null })}
                      title="Podvoji in uredi"
                      className="shrink-0 p-1.5 text-slate-400 hover:text-brand-orange"
                    >
                      <Copy size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
