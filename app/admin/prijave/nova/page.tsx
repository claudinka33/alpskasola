"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const programi = [
  { value: "sola-smucanja", label: "Tečaji smučanja in bordanja" },
  { value: "ski-racing-team", label: "Tekmovalne ekipe" },
  { value: "smucarska-akademija", label: "Smučarska akademija" },
  { value: "plavalni-tecaj", label: "Tečaj plavanja" },
  { value: "sportna-abeceda", label: "Športna abeceda" },
  { value: "sola-rolanja", label: "Tečaj rolanja" },
  { value: "praznovanje-rojstnega-dne", label: "Rojstni dan z Alpsko šolo" },
  { value: "servis", label: "Servis smuči" },
  { value: "izposoja-opreme", label: "Izposoja opreme" },
];

export default function NovaPrijavaPage() {
  const router = useRouter();
  const [posiljam, setPosiljam] = useState(false);
  const [napaka, setNapaka] = useState("");
  const [uspeh, setUspeh] = useState(false);
  const [form, setForm] = useState({
    program: "",
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
  });

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");

    try {
      const res = await fetch("/api/prijave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setNapaka(data.error || "Napaka pri shranjevanju.");
      } else {
        setUspeh(true);
        setTimeout(() => router.push("/admin/prijave"), 1500);
      }
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setPosiljam(false);
    }
  };

  if (uspeh) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy mb-2">Prijava dodana!</h1>
        <p className="text-sm text-slate-600">Preusmerjam...</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/prijave"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange mb-4"
      >
        <ArrowLeft size={14} /> Nazaj na prijave
      </Link>

      <h1 className="text-3xl font-extrabold text-brand-navy mb-2">Nova prijava</h1>
      <p className="text-sm text-slate-600 mb-6">
        Ročno dodaj prijavnico (npr. ko nekdo pokliče po telefonu).
      </p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200/70 p-6 lg:p-8 max-w-3xl">
        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">Program</h2>
          <select
            required
            value={form.program}
            onChange={(e) => update("program", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm bg-white"
          >
            <option value="">— izberi program —</option>
            {programi.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">Otrok</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Ime *" value={form.otrok_ime} onChange={(v) => update("otrok_ime", v)} required />
            <F label="Priimek *" value={form.otrok_priimek} onChange={(v) => update("otrok_priimek", v)} required />
            <F label="Datum rojstva *" type="date" value={form.otrok_rojstvo} onChange={(v) => update("otrok_rojstvo", v)} required />
            <F label="Predznanje" value={form.otrok_znanje} onChange={(v) => update("otrok_znanje", v)} />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">Starš</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Ime *" value={form.starsi_ime} onChange={(v) => update("starsi_ime", v)} required />
            <F label="Priimek *" value={form.starsi_priimek} onChange={(v) => update("starsi_priimek", v)} required />
            <F label="Email *" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            <F label="Telefon *" type="tel" value={form.telefon} onChange={(v) => update("telefon", v)} required />
            <F label="Naslov" value={form.naslov} onChange={(v) => update("naslov", v)} />
            <F label="Pošta" value={form.posta} onChange={(v) => update("posta", v)} />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">Opomba</h2>
          <textarea
            value={form.opomba}
            onChange={(e) => update("opomba", e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm resize-y"
          />
        </div>

        {napaka && (
          <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-lg mb-4 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{napaka}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={posiljam}
          className="bg-brand-orange text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 inline-flex items-center gap-2"
        >
          {posiljam ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Shranjujem...
            </>
          ) : (
            "Dodaj prijavo"
          )}
        </button>
      </form>
    </div>
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
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
      />
    </div>
  );
}
