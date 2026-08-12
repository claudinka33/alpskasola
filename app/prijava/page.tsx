"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const znanja = [
  { value: "zacetnik", label: "Začetnik" },
  { value: "osnovno", label: "Osnovno znanje" },
  { value: "srednje", label: "Srednje znanje" },
  { value: "napredno", label: "Napredno" },
  { value: "tekmovalno", label: "Tekmovalna raven" },
];

const paketiRojstniDan = [
  { value: "vodna", label: "Vodna zabava (Terme Zreče)" },
  { value: "sportna", label: "Športna norišnica na prostem" },
  { value: "nogomet", label: "Nogometna zabava pravih prvakov" },
];

const aktivnostiSportna = [
  "Med dvema ognjema",
  "Mini rokomet",
  "Poligon z ovirami",
  "Štafetne igre",
  "Metanje na tarčo",
  "Spretnostni izzivi",
  "Ravnotežne igre",
  "Igre z frizbijem",
  "Iskanje zaklada",
  "Ekipne misije",
  "Vleka vrvi",
  "Igra z vodnimi baloni",
];

type Program = { slug: string; naziv: string };

type FormPolje = {
  kljuc: string;
  label: string;
  tip: string;
  moznosti: string | null;
  obvezno: boolean;
};

// Privzeta polja, če nastavitev za program (še) ni
const PRIVZETA_POLJA: FormPolje[] = [
  { kljuc: "otrok_znanje", label: "Predznanje", tip: "select", moznosti: null, obvezno: false },
  { kljuc: "naslov", label: "Naslov", tip: "text", moznosti: null, obvezno: false },
  { kljuc: "posta", label: "Pošta in kraj", tip: "text", moznosti: null, obvezno: false },
  { kljuc: "opomba", label: "Opomba", tip: "textarea", moznosti: null, obvezno: false },
];

function PrijavnaStranContent() {
  const searchParams = useSearchParams();
  const initialProgram = searchParams.get("program") || "";
  const initialPaket = searchParams.get("paket") || "";

  const [programi, setProgrami] = useState<Program[]>([]);
  const [stanje, setStanje] = useState<"obrazec" | "poslano">("obrazec");
  const [napaka, setNapaka] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [form, setForm] = useState({
    program: initialProgram,
    otrok_ime: "",
    otrok_priimek: "",
    otrok_rojstvo: "",
    otrok_znanje: "",
    starsi_ime: "",
    starsi_priimek: "",
    email: "",
    telefon: "",
    naslov: "",
    posta: "",
    opomba: "",
    soglasje: false,
    // Rojstnodnevna polja
    rd_paket: initialPaket,
    rd_datum: "",
    rd_stevilo_otrok: "",
    rd_aktivnosti: [] as string[],
  });

  const jeRojstniDan = form.program === "praznovanje-rojstnega-dne";
  const jeSportna = form.rd_paket === "sportna";

  // Nastavljiva polja za izbrani program
  const [polja, setPolja] = useState<FormPolje[]>(PRIVZETA_POLJA);
  const [dodatnoVal, setDodatnoVal] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!form.program) {
      setPolja(PRIVZETA_POLJA);
      return;
    }
    fetch(`/api/form-config?program=${encodeURIComponent(form.program)}`)
      .then((r) => r.json())
      .then((d) => setPolja(d.polja && d.polja.length > 0 ? d.polja : PRIVZETA_POLJA))
      .catch(() => setPolja(PRIVZETA_POLJA));
  }, [form.program]);

  const polje = (kljuc: string) => polja.find((p) => p.kljuc === kljuc);
  const ostalaPolja = polja.filter(
    (p) => !["otrok_znanje", "naslov", "posta"].includes(p.kljuc)
  );

  useEffect(() => {
    // Samo programi, ki so v CRM označeni kot "Na prijavnici"
    fetch("/api/prijavnica-programi")
      .then((r) => r.json())
      .then((d) => {
        const vidni = (d.programi || []).filter(
          (p: any) => p.na_prijavnici === true && p.aktiven !== false
        );
        setProgrami(vidni);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialProgram && initialProgram !== form.program) {
      setForm((f) => ({ ...f, program: initialProgram }));
    }
  }, [initialProgram]);

  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const MAX_AKTIVNOSTI = 3;

  const toggleAktivnost = (a: string) => {
    const exists = form.rd_aktivnosti.includes(a);
    if (!exists && form.rd_aktivnosti.length >= MAX_AKTIVNOSTI) return;
    setForm({
      ...form,
      rd_aktivnosti: exists
        ? form.rd_aktivnosti.filter((x) => x !== a)
        : [...form.rd_aktivnosti, a],
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");

    if (!form.soglasje) {
      setNapaka("Prosimo, potrdite soglasje.");
      setPosiljam(false);
      return;
    }

    // Sestavi opombo z rojstnodnevnimi podatki
    let opombaFull = form.opomba;
    if (jeRojstniDan) {
      const paketLabel = paketiRojstniDan.find((p) => p.value === form.rd_paket)?.label;
      opombaFull = `🎂 ROJSTNI DAN
Paket: ${paketLabel || "—"}
Želen datum: ${form.rd_datum || "—"}
Število otrok: ${form.rd_stevilo_otrok || "—"}
${form.rd_aktivnosti.length > 0 ? "Izbrane aktivnosti: " + form.rd_aktivnosti.join(", ") : ""}

${form.opomba ? "Opomba starša: " + form.opomba : ""}`;
    }

    try {
      const res = await fetch("/api/prijave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, opomba: opombaFull, dodatno: dodatnoVal }),
      });
      const data = await res.json();
      if (!res.ok) setNapaka(data.error || "Napaka.");
      else setStanje("poslano");
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setPosiljam(false);
    }
  };

  if (stanje === "poslano") {
    return (
      <>
        <Navbar />
        <section className="bg-gradient-to-b from-blue-50 to-white min-h-[70vh] flex items-center py-20">
          <div className="max-w-2xl mx-auto px-4 lg:px-8 text-center">
            <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
              <CheckCircle2 size={42} />
            </div>
            <h1 className="text-4xl font-extrabold text-brand-navy mb-3">Prijava poslana!</h1>
            <p className="text-lg text-slate-600 mb-8">Hvala, kontaktiramo vas v kratkem.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold">
              Nazaj domov <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="mountain-bg py-16 lg:py-20 border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-brand-navy tracking-tight leading-[1.1] mb-3">Prijavnica</h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto">Izpolnite obrazec. Polja z * so obvezna.</p>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <form onSubmit={onSubmit} className="bg-white border border-slate-200/70 rounded-2xl p-6 lg:p-10">
            {/* Program */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">1. Program</h2>
              <select required value={form.program} onChange={(e) => update("program", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                <option value="">— izberi program —</option>
                {programi.map((p) => <option key={p.slug} value={p.slug}>{p.naziv}</option>)}
              </select>
            </div>

            {/* ROJSTNI DAN polja */}
            {jeRojstniDan && (
              <div className="mb-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                <h2 className="text-lg font-bold text-brand-navy mb-3 flex items-center gap-2">
                  🎂 Rojstnodnevne podrobnosti
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-1.5">Paket *</label>
                    <select required value={form.rd_paket} onChange={(e) => update("rd_paket", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                      <option value="">— izberi paket —</option>
                      {paketiRojstniDan.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <F label="Želen datum praznovanja *" type="date" value={form.rd_datum} onChange={(v) => update("rd_datum", v)} required />
                    <F label="Pričakovano število otrok *" type="number" value={form.rd_stevilo_otrok} onChange={(v) => update("rd_stevilo_otrok", v)} required />
                  </div>

                  {jeSportna && (
                    <div>
                      <label className="block text-sm font-semibold text-brand-navy mb-2">
                        Katere aktivnosti želi slavljenec? (izberite 3)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {aktivnostiSportna.map((a) => {
                          const izbrana = form.rd_aktivnosti.includes(a);
                          const poln = !izbrana && form.rd_aktivnosti.length >= MAX_AKTIVNOSTI;
                          return (
                            <label
                              key={a}
                              className={`flex items-start gap-2 bg-white rounded-lg p-2.5 border border-slate-200 ${
                                poln
                                  ? "opacity-40 cursor-not-allowed"
                                  : "cursor-pointer hover:border-brand-orange"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={izbrana}
                                disabled={poln}
                                onChange={() => toggleAktivnost(a)}
                                className="mt-0.5 w-4 h-4 accent-brand-orange shrink-0"
                              />
                              <span className="text-xs text-slate-700">{a}</span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Izbrane: {form.rd_aktivnosti.length}/{MAX_AKTIVNOSTI}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Otrok */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">
                {jeRojstniDan ? "2. Slavljenec" : "2. Otrok"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Ime *" value={form.otrok_ime} onChange={(v) => update("otrok_ime", v)} required />
                <F label="Priimek *" value={form.otrok_priimek} onChange={(v) => update("otrok_priimek", v)} required />
                <F label="Datum rojstva *" type="date" value={form.otrok_rojstvo} onChange={(v) => update("otrok_rojstvo", v)} required />
                {!jeRojstniDan && polje("otrok_znanje") && (
                  <div>
                    <label className="block text-sm font-semibold text-brand-navy mb-1.5">
                      Predznanje{polje("otrok_znanje")!.obvezno ? " *" : ""}
                    </label>
                    <select
                      value={form.otrok_znanje}
                      onChange={(e) => update("otrok_znanje", e.target.value)}
                      required={polje("otrok_znanje")!.obvezno}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm bg-white"
                    >
                      <option value="">— izberi —</option>
                      {znanja.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Starš */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">3. Starš</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Ime *" value={form.starsi_ime} onChange={(v) => update("starsi_ime", v)} required />
                <F label="Priimek *" value={form.starsi_priimek} onChange={(v) => update("starsi_priimek", v)} required />
                <F label="Email *" type="email" value={form.email} onChange={(v) => update("email", v)} required />
                <F label="Telefon *" type="tel" value={form.telefon} onChange={(v) => update("telefon", v)} required />
                {polje("naslov") && (
                  <F
                    label={`Naslov${polje("naslov")!.obvezno ? " *" : ""}`}
                    value={form.naslov}
                    onChange={(v) => update("naslov", v)}
                    required={polje("naslov")!.obvezno}
                  />
                )}
                {polje("posta") && (
                  <F
                    label={`Pošta${polje("posta")!.obvezno ? " *" : ""}`}
                    value={form.posta}
                    onChange={(v) => update("posta", v)}
                    required={polje("posta")!.obvezno}
                  />
                )}
              </div>
            </div>

            {/* Nastavljiva polja (alergije, opomba, polja po meri...) */}
            {ostalaPolja.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-brand-navy mb-3">4. Dodatno</h2>
                <div className="space-y-4">
                  {ostalaPolja.map((p) => {
                    const jeOpomba = p.kljuc === "opomba";
                    const vrednost = jeOpomba ? form.opomba : dodatnoVal[p.kljuc] || "";
                    const nastavi = (v: string) =>
                      jeOpomba
                        ? update("opomba", v)
                        : setDodatnoVal((prev) => ({ ...prev, [p.kljuc]: v }));
                    return (
                      <div key={p.kljuc}>
                        <label className="block text-sm font-semibold text-brand-navy mb-1.5">
                          {p.label}{p.obvezno ? " *" : ""}
                        </label>
                        {p.tip === "textarea" ? (
                          <textarea
                            value={vrednost}
                            onChange={(e) => nastavi(e.target.value)}
                            required={p.obvezno}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm resize-y"
                          />
                        ) : p.tip === "select" ? (
                          <select
                            value={vrednost}
                            onChange={(e) => nastavi(e.target.value)}
                            required={p.obvezno}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm bg-white"
                          >
                            <option value="">— izberi —</option>
                            {(p.moznosti || "")
                              .split(",")
                              .map((m) => m.trim())
                              .filter(Boolean)
                              .map((m) => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                          </select>
                        ) : p.tip === "checkbox" ? (
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={vrednost === "Da"}
                              onChange={(e) => nastavi(e.target.checked ? "Da" : "")}
                              required={p.obvezno}
                              className="w-4 h-4 accent-brand-orange"
                            />
                            Da
                          </label>
                        ) : (
                          <input
                            type={p.tip === "date" ? "date" : "text"}
                            value={vrednost}
                            onChange={(e) => nastavi(e.target.value)}
                            required={p.obvezno}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input type="checkbox" checked={form.soglasje} onChange={(e) => update("soglasje", e.target.checked)} className="mt-1 w-4 h-4 accent-brand-orange" />
              <span className="text-sm text-slate-600">Strinjam se z obdelavo osebnih podatkov. *</span>
            </label>

            {napaka && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{napaka}</span>
              </div>
            )}

            <button type="submit" disabled={posiljam} className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {posiljam ? <><Loader2 size={18} className="animate-spin" /> Pošiljam...</> : <>Pošlji prijavo <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default function PrijavnaStranPage() {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={32} /></div>}>
        <PrijavnaStranContent />
      </Suspense>
    </main>
  );
}

function F({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-navy mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm"
      />
    </div>
  );
}
