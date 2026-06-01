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

type Program = { slug: string; naziv: string };

function PrijavnaStranContent() {
  const searchParams = useSearchParams();
  const initialProgram = searchParams.get("program") || "";

  const [programi, setProgrami] = useState<Program[]>([]);
  const [stanje, setStanje] = useState<"obrazec" | "poslano" | "napaka">("obrazec");
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
  });

  useEffect(() => {
    fetch("/api/programi")
      .then((r) => r.json())
      .then((d) => {
        const aktivni = (d.programi || []).filter((p: any) => p.aktiven !== false);
        setProgrami(aktivni);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialProgram && initialProgram !== form.program) {
      setForm((f) => ({ ...f, program: initialProgram }));
    }
  }, [initialProgram]);

  const update = (k: string, v: string | boolean) => setForm({ ...form, [k]: v });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");

    if (!form.soglasje) {
      setNapaka("Prosimo, potrdite soglasje.");
      setPosiljam(false);
      return;
    }

    try {
      const res = await fetch("/api/prijave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">1. Program</h2>
              <select required value={form.program} onChange={(e) => update("program", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                <option value="">— izberi program —</option>
                {programi.map((p) => <option key={p.slug} value={p.slug}>{p.naziv}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">2. Otrok</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Ime *" value={form.otrok_ime} onChange={(v) => update("otrok_ime", v)} required />
                <F label="Priimek *" value={form.otrok_priimek} onChange={(v) => update("otrok_priimek", v)} required />
                <F label="Datum rojstva *" type="date" value={form.otrok_rojstvo} onChange={(v) => update("otrok_rojstvo", v)} required />
                <div>
                  <label className="block text-sm font-semibold text-brand-navy mb-1.5">Predznanje</label>
                  <select value={form.otrok_znanje} onChange={(e) => update("otrok_znanje", e.target.value)} className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm bg-white">
                    <option value="">— izberi —</option>
                    {znanja.map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">3. Starš</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <F label="Ime *" value={form.starsi_ime} onChange={(v) => update("starsi_ime", v)} required />
                <F label="Priimek *" value={form.starsi_priimek} onChange={(v) => update("starsi_priimek", v)} required />
                <F label="Email *" type="email" value={form.email} onChange={(v) => update("email", v)} required />
                <F label="Telefon *" type="tel" value={form.telefon} onChange={(v) => update("telefon", v)} required />
                <F label="Naslov" value={form.naslov} onChange={(v) => update("naslov", v)} />
                <F label="Pošta" value={form.posta} onChange={(v) => update("posta", v)} />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-brand-navy mb-3">4. Opomba</h2>
              <textarea value={form.opomba} onChange={(e) => update("opomba", e.target.value)} rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm resize-y" />
            </div>

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

function F({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-navy mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm" />
    </div>
  );
}
