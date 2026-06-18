"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

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

const statusi = [
  { value: "nova", label: "Nova" },
  { value: "potrjeno", label: "Potrjeno" },
  { value: "placano", label: "Plačano" },
  { value: "koncano", label: "Končano" },
  { value: "preklicano", label: "Preklicano" },
];

export default function UrediPrijavoPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  const [nalagam, setNalagam] = useState(true);
  const [posiljam, setPosiljam] = useState(false);
  const [brisem, setBrisem] = useState(false);
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
    termin: "",
    cena: "",
    status: "nova",
    opomba: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/prijave/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.prijava) {
          const p = d.prijava;
          setForm({
            program: p.program || "",
            otrok_ime: p.otrok_ime || "",
            otrok_priimek: p.otrok_priimek || "",
            otrok_rojstvo: (p.otrok_rojstvo || "").slice(0, 10),
            otrok_znanje: p.otrok_znanje || "",
            starsi_ime: p.starsi_ime || "",
            starsi_priimek: p.starsi_priimek || "",
            email: p.email || "",
            telefon: p.telefon || "",
            naslov: p.naslov || "",
            posta: p.posta || "",
            termin: p.termin || "",
            cena: p.cena != null ? String(p.cena) : "",
            status: p.status || "nova",
            opomba: p.opomba || "",
          });
        } else {
          setNapaka("Prijavnice ni mogoče naložiti.");
        }
      })
      .catch(() => setNapaka("Napaka pri nalaganju."))
      .finally(() => setNalagam(false));
  }, [id]);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const shrani = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");
    try {
      const res = await fetch(`/api/prijave/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setNapaka(d.error || "Napaka pri shranjevanju.");
      } else {
        setUspeh(true);
        setTimeout(() => router.push(`/admin/prijave/${id}`), 1200);
      }
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setPosiljam(false);
    }
  };

  const izbrisi = async () => {
    if (!confirm("Res želiš izbrisati to prijavnico? Tega ni mogoče razveljaviti.")) return;
    setBrisem(true);
    setNapaka("");
    try {
      const res = await fetch(`/api/prijave/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        setNapaka(d.error || "Napaka pri brisanju.");
        setBrisem(false);
      } else {
        router.push("/admin/prijave");
      }
    } catch {
      setNapaka("Napaka pri povezavi.");
      setBrisem(false);
    }
  };

  if (nalagam) {
    return (
      <div className="py-16 text-center">
        <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
      </div>
    );
  }

  if (uspeh) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-brand-navy mb-2">Shranjeno!</h1>
        <p className="text-sm text-slate-600">Preusmerjam...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/admin/prijave/${id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange mb-4"
      >
        <ArrowLeft size={14} /> Nazaj na prijavo
      </Link>

      <h1 className="text-3xl font-extrabold text-brand-navy mb-6">Uredi prijavnico</h1>

      <form onSubmit={shrani} className="bg-white rounded-2xl border border-slate-200/70 p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-brand-navy mb-3">Program in status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Program</label>
              <select
                value={form.program}
                onChange={(e) => update("program", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm bg-white"
              >
                <option value="">— izberi program —</option>
                {programi.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm bg-white"
              >
                {statusi.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-brand-navy mb-3">Otrok</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Ime" value={form.otrok_ime} onChange={(v) => update("otrok_ime", v)} required />
            <F label="Priimek" value={form.otrok_priimek} onChange={(v) => update("otrok_priimek", v)} required />
            <F label="Datum rojstva" type="date" value={form.otrok_rojstvo} onChange={(v) => update("otrok_rojstvo", v)} required />
            <F label="Predznanje" value={form.otrok_znanje} onChange={(v) => update("otrok_znanje", v)} />
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-brand-navy mb-3">Starš</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Ime" value={form.starsi_ime} onChange={(v) => update("starsi_ime", v)} required />
            <F label="Priimek" value={form.starsi_priimek} onChange={(v) => update("starsi_priimek", v)} required />
            <F label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            <F label="Telefon" type="tel" value={form.telefon} onChange={(v) => update("telefon", v)} required />
            <F label="Naslov" value={form.naslov} onChange={(v) => update("naslov", v)} />
            <F label="Pošta" value={form.posta} onChange={(v) => update("posta", v)} />
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-brand-navy mb-3">Dodatno</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Termin" value={form.termin} onChange={(v) => update("termin", v)} />
            <F label="Cena (EUR)" type="number" value={form.cena} onChange={(v) => update("cena", v)} />
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Opomba / alergije</label>
            <textarea
              value={form.opomba}
              onChange={(e) => update("opomba", e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm resize-y"
            />
          </div>
        </div>

        {napaka && (
          <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-lg text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{napaka}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={izbrisi}
            disabled={brisem}
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {brisem ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Izbriši prijavnico
          </button>

          <button
            type="submit"
            disabled={posiljam}
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-brand-orange-dark transition-colors disabled:opacity-50"
          >
            {posiljam ? <><Loader2 size={16} className="animate-spin" /> Shranjujem...</> : "Shrani spremembe"}
          </button>
        </div>
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
