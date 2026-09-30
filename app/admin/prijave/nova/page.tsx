"use client";

import { useEffect, useState } from "react";
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

type FormPolje = {
  kljuc: string;
  label: string;
  tip: string;
  moznosti: string | null;
  obvezno: boolean;
};

type Termin = {
  id: number;
  naziv: string;
  datum_od: string | null;
  datum_do: string | null;
  cena: number | null;
  status: string;
  aktiven: boolean;
  lokacija: string | null;
  dan: string | null;
  ura: string | null;
};

// Polja, ki imajo v obrazcu svoje fiksno mesto
const SISTEMSKA = ["otrok_znanje", "naslov", "posta", "opomba"];

function fmtDatum(d: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getDate()}. ${dt.getMonth() + 1}. ${dt.getFullYear()}`;
}

function datumObseg(t: Termin) {
  const od = fmtDatum(t.datum_od);
  const doo = fmtDatum(t.datum_do);
  if (od && doo && od !== doo) return `${od} – ${doo}`;
  return od || doo;
}

function opisTermina(t: Termin) {
  const deli = [t.naziv];
  const d = datumObseg(t);
  if (d) deli.push(d);
  else if (t.dan || t.ura) deli.push([t.dan, t.ura].filter(Boolean).join(" "));
  if (t.lokacija) deli.push(t.lokacija);
  let s = deli.join(" · ");
  if (!t.aktiven) s += " (neaktiven)";
  else if (t.status && t.status !== "odprt") s += ` (${t.status})`;
  return s;
}

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

  // Nastavljiva polja programa (npr. Številka igralnice) in termini/skupine
  const [polja, setPolja] = useState<FormPolje[]>([]);
  const [dodatno, setDodatno] = useState<Record<string, string>>({});
  const [termini, setTermini] = useState<Termin[]>([]);
  const [terminId, setTerminId] = useState<string>("");
  const [nalagam, setNalagam] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setPolja([]);
    setDodatno({});
    setTermini([]);
    setTerminId("");
    if (!form.program) return;
    setNalagam(true);
    const p = encodeURIComponent(form.program);
    Promise.all([
      fetch(`/api/form-config?program=${p}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ polja: [] })),
      fetch(`/api/termini?program=${p}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => ({ termini: [] })),
    ])
      .then(([f, t]) => {
        setPolja(f.polja || []);
        setTermini(t.termini || []);
      })
      .finally(() => setNalagam(false));
  }, [form.program]);

  const polje = (kljuc: string) => polja.find((p) => p.kljuc === kljuc);
  const obvezno = (kljuc: string) => !!polje(kljuc)?.obvezno;
  const dodatnaPolja = polja.filter((p) => !SISTEMSKA.includes(p.kljuc));
  const izbranTermin = termini.find((t) => String(t.id) === terminId) || null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");

    try {
      const res = await fetch("/api/prijave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dodatno,
          termin: izbranTermin
            ? `${izbranTermin.naziv}${datumObseg(izbranTermin) ? " (" + datumObseg(izbranTermin) + ")" : ""}`
            : null,
          termin_id: izbranTermin?.id ?? null,
          cena: izbranTermin?.cena ?? null,
        }),
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

  const zvezdica = (kljuc: string) => (obvezno(kljuc) ? " *" : "");

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
          {nalagam && (
            <p className="text-xs text-slate-500 mt-2 inline-flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Nalagam polja in termine...
            </p>
          )}
        </div>

        {termini.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-brand-navy mb-3">Termin / skupina</h2>
            <select
              value={terminId}
              onChange={(e) => setTerminId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm bg-white"
            >
              <option value="">— brez termina —</option>
              {termini.map((t) => (
                <option key={t.id} value={t.id}>{opisTermina(t)}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1.5">
              Prikazani so vsi termini programa, tudi polni in zaprti (za zamenjave).
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">Otrok</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Ime *" value={form.otrok_ime} onChange={(v) => update("otrok_ime", v)} required />
            <F label="Priimek *" value={form.otrok_priimek} onChange={(v) => update("otrok_priimek", v)} required />
            <F label="Datum rojstva *" type="date" value={form.otrok_rojstvo} onChange={(v) => update("otrok_rojstvo", v)} required />
            <F
              label={`${polje("otrok_znanje")?.label || "Predznanje"}${zvezdica("otrok_znanje")}`}
              value={form.otrok_znanje}
              onChange={(v) => update("otrok_znanje", v)}
              required={obvezno("otrok_znanje")}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">Starš</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Ime *" value={form.starsi_ime} onChange={(v) => update("starsi_ime", v)} required />
            <F label="Priimek *" value={form.starsi_priimek} onChange={(v) => update("starsi_priimek", v)} required />
            <F label="Email *" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            <F label="Telefon *" type="tel" value={form.telefon} onChange={(v) => update("telefon", v)} required />
            <F
              label={`${polje("naslov")?.label || "Naslov"}${zvezdica("naslov")}`}
              value={form.naslov}
              onChange={(v) => update("naslov", v)}
              required={obvezno("naslov")}
            />
            <F
              label={`${polje("posta")?.label || "Pošta"}${zvezdica("posta")}`}
              value={form.posta}
              onChange={(v) => update("posta", v)}
              required={obvezno("posta")}
            />
          </div>
        </div>

        {dodatnaPolja.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-brand-navy mb-3">Dodatno</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dodatnaPolja.map((p) => (
                <DodatnoPolje
                  key={p.kljuc}
                  p={p}
                  value={dodatno[p.kljuc] || ""}
                  onChange={(v) => setDodatno((prev) => ({ ...prev, [p.kljuc]: v }))}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-base font-bold text-brand-navy mb-3">
            {polje("opomba")?.label || "Opomba"}{zvezdica("opomba")}
          </h2>
          <textarea
            value={form.opomba}
            onChange={(e) => update("opomba", e.target.value)}
            required={obvezno("opomba")}
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
          disabled={posiljam || nalagam}
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

const vnosClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm";

function DodatnoPolje({
  p,
  value,
  onChange,
}: {
  p: FormPolje;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = `${p.label}${p.obvezno ? " *" : ""}`;

  if (p.tip === "textarea") {
    return (
      <div className="sm:col-span-2">
        <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={p.obvezno}
          rows={3}
          className={`${vnosClass} resize-y`}
        />
      </div>
    );
  }

  if (p.tip === "select") {
    const moznosti = (p.moznosti || "")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={p.obvezno}
          className={`${vnosClass} bg-white`}
        >
          <option value="">— izberi —</option>
          {moznosti.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    );
  }

  if (p.tip === "checkbox") {
    return (
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 py-2">
          <input
            type="checkbox"
            checked={value === "Da"}
            onChange={(e) => onChange(e.target.checked ? "Da" : "")}
            required={p.obvezno}
            className="w-4 h-4 accent-brand-orange"
          />
          Da
        </label>
      </div>
    );
  }

  return (
    <F
      label={label}
      type={p.tip === "date" ? "date" : "text"}
      value={value}
      onChange={onChange}
      required={p.obvezno}
    />
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
        className={vnosClass}
      />
    </div>
  );
}
