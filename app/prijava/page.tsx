"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Alpi from "@/components/Alpi";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const znanja = [
  { value: "zacetnik", label: "Začetnik", opis: "Še ni bil/a na snegu ali šele začenja" },
  { value: "osnovno", label: "Osnovno znanje", opis: "Se ustavi in zavija na lažjih progah" },
  { value: "srednje", label: "Srednje znanje", opis: "Varno vijuga na srednje zahtevnih progah" },
  { value: "napredno", label: "Napredno", opis: "Obvlada tudi zahtevne proge" },
  { value: "tekmovalno", label: "Tekmovalna raven", opis: "Trenira ali tekmuje" },
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

// Ure odhoda avtobusa po postajah (ujemanje po začetku imena postaje)
const VOZNI_RED: [string, string][] = [
  ["celje", "7.30"],
  ["arclin", "7.40"],
  ["frankolovo", "7.50"],
  ["zreče", "8.00"],
];

function PrijavnaStranContent() {
  const searchParams = useSearchParams();
  const initialProgram = searchParams.get("program") || "";
  const initialPaket = searchParams.get("paket") || "";
  const initialTerminId = parseInt(searchParams.get("termin") || "", 10);

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

  // Termini za izbrani program (razpisani v CRM)
  type Termin = {
    id: number;
    naziv: string;
    lokacija: string | null;
    datum_od: string | null;
    datum_do: string | null;
    cena: number | null;
    status: string;
  };
  const [termini, setTermini] = useState<Termin[]>([]);
  const [izbranTermin, setIzbranTermin] = useState<Termin | null>(null);

  useEffect(() => {
    setTermini([]);
    setIzbranTermin(null);
    if (!form.program || jeRojstniDan) return;
    fetch(`/api/termini?program=${encodeURIComponent(form.program)}&aktivni=1`)
      .then((r) => r.json())
      .then((d) => {
        const seznam: Termin[] = d.termini || [];
        setTermini(seznam);
        // Predizbira termina iz URL (gumb "Prijavi se na ta termin" na strani programa)
        if (initialTerminId) {
          const t = seznam.find((x) => x.id === initialTerminId);
          if (t && t.status !== "poln" && t.status !== "zaseden") {
            setIzbranTermin(t);
            setTimeout(() => {
              document.getElementById(`termin-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 150);
          }
        }
      })
      .catch(() => setTermini([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.program]);

  const datumObseg = (t: Termin) => {
    const f = (s: string | null) =>
      s ? new Date(s).toLocaleDateString("sl-SI", { day: "numeric", month: "numeric", year: "numeric" }) : "";
    if (t.datum_od && t.datum_do) return `${f(t.datum_od)} – ${f(t.datum_do)}`;
    return f(t.datum_od) || "";
  };

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
  // Avtobus, alergije in karta so v svojem okvirju pod programom
  const POSEBNA = ["vstopna_tocka", "alergije", "karta"];
  const poljeAvtobus = polje("vstopna_tocka");
  const poljeAlergije = polje("alergije");
  const poljeKarta = polje("karta");
  const ostalaPolja = polja.filter(
    (p) => !["otrok_znanje", "naslov", "posta", ...POSEBNA].includes(p.kljuc)
  );
  const nastaviDodatno = (k: string, v: string) => setDodatnoVal((prev) => ({ ...prev, [k]: v }));
  const postaje = (poljeAvtobus?.moznosti || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

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

    if (termini.length > 0 && !izbranTermin) {
      setNapaka("Prosimo, izberite termin.");
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
        body: JSON.stringify({
          ...form,
          opomba: opombaFull,
          dodatno: dodatnoVal,
          termin: izbranTermin
            ? `${izbranTermin.naziv}${datumObseg(izbranTermin) ? " (" + datumObseg(izbranTermin) + ")" : ""}`
            : null,
          termin_id: izbranTermin?.id ?? null,
          cena: izbranTermin?.cena ?? null,
        }),
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
            <Alpi poza="skok" className="mx-auto mb-4 h-40 sm:h-52 w-auto" alt="Alpi skoči od veselja" />
            <h1 className="text-4xl font-extrabold text-brand-navy mb-3">Prijava poslana! 🎉</h1>
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
      <section className="relative overflow-hidden bg-brand-navy">
        <img src="/tekmovalci/14.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-brand-navy/40" />
        <Alpi poza="kaze" className="absolute bottom-0 left-1 sm:left-[6%] lg:left-[12%] h-20 sm:h-32 lg:h-40 w-auto translate-y-[10%]" alt="Alpi pokaže na prijavnico" />
        <div className="relative max-w-3xl mx-auto px-4 lg:px-8 py-8 lg:py-10 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-brand-orange text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            ⛷️ Alpska šola · Rogla
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.1] mb-2">Prijavnica 🎿</h1>
          <p className="text-sm lg:text-base text-white/85 max-w-xl mx-auto">
            Prijava vzame le nekaj minut. Polja z * so obvezna — potrditev dobite na e-pošto. 📩
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs font-semibold">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🏔️ Šola na Rogli</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">👨‍🏫 Licencirani učitelji</span>
            <a href="tel:064230888" className="bg-white/10 border border-white/20 rounded-full px-3 py-1 hover:bg-white/20">📞 064 230 888</a>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-6 lg:py-8">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <form onSubmit={onSubmit} className="bg-white border border-slate-200/70 border-t-4 border-t-brand-orange rounded-2xl p-4 sm:p-6 shadow-xl shadow-brand-navy/5">
            {/* Program */}
            <div className="mb-5">
              <h2 className="text-base font-bold text-brand-navy mb-2">🎿 1. Program</h2>
              <select required value={form.program} onChange={(e) => update("program", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                <option value="">— izberi program —</option>
                {programi.map((p) => <option key={p.slug} value={p.slug}>{p.naziv}</option>)}
              </select>
            </div>

            {/* Termini (razpisani v CRM) */}
            {termini.length > 0 && (
              <div className="mb-5">
                <h2 className="text-base font-bold text-brand-navy mb-2">Izberite termin *</h2>
                <div className="space-y-2">
                  {termini.map((t) => {
                    const izbran = izbranTermin?.id === t.id;
                    const poln = t.status === "poln" || t.status === "zaseden";
                    return (
                      <label
                        key={t.id}
                        id={`termin-${t.id}`}
                        className={`flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 transition-colors ${
                          poln
                            ? "opacity-50 cursor-not-allowed border-slate-200"
                            : izbran
                            ? "border-brand-orange bg-orange-50 cursor-pointer"
                            : "border-slate-200 hover:border-brand-orange/50 cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="termin"
                          checked={izbran}
                          disabled={poln}
                          onChange={() => setIzbranTermin(t)}
                          className="w-4 h-4 accent-brand-orange shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-brand-navy text-sm">
                            {t.naziv}
                            {poln && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">ZASEDENO</span>}
                          </div>
                          <div className="text-xs text-slate-500">
                            {[datumObseg(t), t.lokacija].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                        {t.cena != null && (
                          <div className="text-base font-extrabold text-brand-navy shrink-0">{t.cena}€</div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Otrok */}
            <div className="mb-5">
              <h2 className="text-base font-bold text-brand-navy mb-2">
                {jeRojstniDan ? "🎂 2. Slavljenec" : "🧒 2. Otrok"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Ime *" value={form.otrok_ime} onChange={(v) => update("otrok_ime", v)} required />
                <F label="Priimek *" value={form.otrok_priimek} onChange={(v) => update("otrok_priimek", v)} required />
                <F label="Datum rojstva *" type="date" value={form.otrok_rojstvo} onChange={(v) => update("otrok_rojstvo", v)} required />
              </div>
            </div>

            {/* AVTOBUS, KOSILO, KARTA (Alpska šola smučanja / bordanja, Mini) */}
            {(poljeAvtobus || poljeAlergije || poljeKarta || polje("otrok_znanje")) && !jeRojstniDan && (
              <div className="mb-5 bg-sky-50 border-2 border-sky-200 rounded-xl p-4 space-y-5">
                {polje("otrok_znanje") && (
                  <div>
                    <h2 className="text-base font-bold text-brand-navy mb-0.5 flex items-center gap-2">
                      ⛷️ Predznanje otroka{polje("otrok_znanje")!.obvezno ? " *" : ""}
                    </h2>
                    <p className="text-[13px] text-slate-600 mb-2">Označite, kar najbolj opiše otroka — po tem ga razvrstimo v pravo skupino.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {znanja.map((z) => {
                        const izbrano = form.otrok_znanje === z.value;
                        return (
                          <label
                            key={z.value}
                            className={`flex items-center gap-3 rounded-lg border-2 bg-white px-3 py-1.5 cursor-pointer transition-colors ${
                              izbrano ? "border-brand-orange bg-orange-50" : "border-slate-200 hover:border-brand-orange/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="otrok_znanje"
                              value={z.value}
                              checked={izbrano}
                              required={polje("otrok_znanje")!.obvezno}
                              onChange={() => update("otrok_znanje", z.value)}
                              className="w-4 h-4 accent-brand-orange shrink-0"
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-brand-navy">{z.label}</span>
                              <span className="block text-xs text-slate-500">{z.opis}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {poljeAvtobus && (
                  <div>
                    <h2 className="text-base font-bold text-brand-navy mb-0.5 flex items-center gap-2">🚌 Avtobus na Roglo</h2>
                    <p className="text-[13px] text-slate-600 mb-2">
                      Avtobus pelje vsako soboto zjutraj na Roglo in ob <strong className="text-brand-navy">15.05</strong> z Rogle nazaj. Označite, kje bo otrok vstopil.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {postaje.map((m) => {
                        const izbrana = dodatnoVal.vstopna_tocka === m;
                        const ura = VOZNI_RED.find(([kraj]) => m.toLowerCase().startsWith(kraj))?.[1];
                        const brez = m.toLowerCase().startsWith("brez");
                        return (
                          <label
                            key={m}
                            className={`flex items-center gap-3 rounded-lg border-2 bg-white px-3 py-2 cursor-pointer transition-colors ${
                              izbrana ? "border-brand-orange bg-orange-50" : "border-slate-200 hover:border-brand-orange/50"
                            } ${brez ? "sm:col-span-2" : ""}`}
                          >
                            <input
                              type="radio"
                              name="vstopna_tocka"
                              value={m}
                              checked={izbrana}
                              required={poljeAvtobus.obvezno}
                              onChange={() => nastaviDodatno("vstopna_tocka", m)}
                              className="w-4 h-4 accent-brand-orange shrink-0"
                            />
                            <span className="flex-1 text-sm font-medium text-brand-navy">{m}</span>
                            {ura && <span className="text-sm font-bold text-brand-navy tabular-nums">{ura}</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {poljeKarta && (
                  <div>
                    <h2 className="text-base font-bold text-brand-navy mb-0.5 flex items-center gap-2">🎿 Smučarska karta</h2>
                    <p className="text-[13px] text-slate-600 mb-2">Karta ni vključena v paket. Pri nas jo dobite po promocijski ceni.</p>
                    <label
                      className={`flex items-center gap-3 rounded-lg border-2 bg-white px-3 py-2 cursor-pointer transition-colors ${
                        dodatnoVal.karta === "Da" ? "border-brand-orange bg-orange-50" : "border-slate-200 hover:border-brand-orange/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dodatnoVal.karta === "Da"}
                        required={poljeKarta.obvezno}
                        onChange={(e) => nastaviDodatno("karta", e.target.checked ? "Da" : "")}
                        className="w-4 h-4 accent-brand-orange shrink-0"
                      />
                      <span className="flex-1 text-sm font-medium text-brand-navy">Da, želim karto</span>
                      <span className="text-sm font-bold text-brand-navy">29 €</span>
                      <s className="text-sm text-slate-400 decoration-red-500/70 decoration-2">32 €</s>
                    </label>
                  </div>
                )}

                {poljeAlergije && (
                  <div>
                    <h2 className="text-base font-bold text-brand-navy mb-0.5 flex items-center gap-2">🍽️ Kosilo in alergije</h2>
                    <p className="text-[13px] text-slate-600 mb-2">Za kosilo v hotelu nam sporočite alergije, prehranske omejitve ali zdravstvene posebnosti otroka.</p>
                    <textarea
                      value={dodatnoVal.alergije || ""}
                      onChange={(e) => nastaviDodatno("alergije", e.target.value)}
                      required={poljeAlergije.obvezno}
                      rows={2}
                      placeholder="npr. alergija na oreščke, brez laktoze … (če ni ničesar, pustite prazno)"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm resize-y bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ROJSTNI DAN polja */}
            {jeRojstniDan && (
              <div className="mb-5 bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <h2 className="text-base font-bold text-brand-navy mb-2 flex items-center gap-2">
                  🎂 Rojstnodnevne podrobnosti
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-brand-navy mb-1">Paket *</label>
                    <select required value={form.rd_paket} onChange={(e) => update("rd_paket", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                      <option value="">— izberi paket —</option>
                      {paketiRojstniDan.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
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

            {/* Starš */}
            <div className="mb-5">
              <h2 className="text-base font-bold text-brand-navy mb-2">👨‍👩‍👧 3. Starš</h2>
              <div className="grid sm:grid-cols-2 gap-3">
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
              <div className="mb-5">
                <h2 className="text-base font-bold text-brand-navy mb-2">📝 4. Dodatno</h2>
                <div className="space-y-3">
                  {ostalaPolja.map((p) => {
                    const jeOpomba = p.kljuc === "opomba";
                    const vrednost = jeOpomba ? form.opomba : dodatnoVal[p.kljuc] || "";
                    const nastavi = (v: string) =>
                      jeOpomba
                        ? update("opomba", v)
                        : setDodatnoVal((prev) => ({ ...prev, [p.kljuc]: v }));
                    return (
                      <div key={p.kljuc}>
                        <label className="block text-[13px] font-semibold text-brand-navy mb-1">
                          {p.label}{p.obvezno ? " *" : ""}
                        </label>
                        {p.tip === "textarea" ? (
                          <textarea
                            value={vrednost}
                            onChange={(e) => nastavi(e.target.value)}
                            required={p.obvezno}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm resize-y"
                          />
                        ) : p.tip === "select" ? (
                          <select
                            value={vrednost}
                            onChange={(e) => nastavi(e.target.value)}
                            required={p.obvezno}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm bg-white"
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
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
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
      <label className="block text-[13px] font-semibold text-brand-navy mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
      />
    </div>
  );
}
