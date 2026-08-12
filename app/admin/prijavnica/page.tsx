"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Loader2,
  Eye,
  EyeOff,
  CalendarDays,
  Cake,
  FileText,
  ArrowRight,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Asterisk,
} from "lucide-react";

type Program = {
  id: number;
  slug: string;
  naziv: string;
  na_prijavnici: boolean;
  aktiven: boolean;
};

export default function PrijavnicaPage() {
  const [programi, setProgrami] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [shranjujem, setShranjujem] = useState<string | null>(null);

  const nalozi = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/prijavnica-programi").then((r) => r.json());
      setProgrami(d.programi || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const preklopi = async (p: Program) => {
    setShranjujem(p.slug);
    // optimističen prikaz
    setProgrami((prev) =>
      prev.map((x) => (x.slug === p.slug ? { ...x, na_prijavnici: !x.na_prijavnici } : x))
    );
    try {
      await fetch("/api/prijavnica-programi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: p.slug, na_prijavnici: !p.na_prijavnici }),
      });
    } catch {
      nalozi(); // ob napaki ponastavi
    } finally {
      setShranjujem(null);
    }
  };

  const stViden = programi.filter((p) => p.na_prijavnici).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
          <ClipboardList size={26} className="text-brand-orange" /> Prijavnica
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Tukaj urejaš vse okoli javne prijavnice — kateri programi so na voljo, termini, rojstni dan in oddane prijave.
        </p>
      </div>

      {/* Programi na prijavnici */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Programi na prijavnici</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vklopi programe, ki naj se pokažejo v spustnem meniju „Izberi program“.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {stViden} vidnih
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : programi.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm px-6">
            Ni programov. (Si zagnala SQL migracijo in dodala programe v bazo?)
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {programi.map((p) => (
              <li key={p.slug} className="flex items-center justify-between gap-3 px-6 py-3.5">
                <div className="min-w-0">
                  <div className="font-semibold text-brand-navy truncate">{p.naziv}</div>
                  <div className="text-[11px] text-slate-400">{p.slug}</div>
                </div>
                <button
                  onClick={() => preklopi(p)}
                  disabled={shranjujem === p.slug}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                    p.na_prijavnici
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {shranjujem === p.slug ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : p.na_prijavnici ? (
                    <Eye size={13} />
                  ) : (
                    <EyeOff size={13} />
                  )}
                  {p.na_prijavnici ? "Na prijavnici" : "Skrit"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Polja prijavnice po programih */}
      <PoljaEditor programi={programi} />

      {/* Bližnjice */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
        Uredi vsebino prijavnice
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <Bliznjica
          href="/admin/termini"
          icon={CalendarDays}
          naslov="Termini"
          opis="Razpiši termine (npr. plavalni tečaj)."
        />
        <Bliznjica
          href="/admin/rojstni-dan"
          icon={Cake}
          naslov="Rojstni dan"
          opis="Uredi pakete in aktivnosti."
        />
        <Bliznjica
          href="/admin/prijave"
          icon={FileText}
          naslov="Oddane prijave"
          opis="Pregled prijav, statusi, izvoz."
        />
      </div>
    </div>
  );
}

type FormPolje = {
  id: number;
  program_slug: string;
  kljuc: string;
  label: string;
  tip: string;
  moznosti: string | null;
  obvezno: boolean;
  viden: boolean;
  vrstni_red: number;
  sistemsko: boolean;
};

const tipi = [
  { value: "text", label: "Besedilo" },
  { value: "textarea", label: "Daljše besedilo" },
  { value: "select", label: "Izbira (spustni meni)" },
  { value: "checkbox", label: "Kljukica (da/ne)" },
  { value: "date", label: "Datum" },
];

function PoljaEditor({ programi }: { programi: Program[] }) {
  const [program, setProgram] = useState("");
  const [polja, setPolja] = useState<FormPolje[]>([]);
  const [loading, setLoading] = useState(false);
  const [novo, setNovo] = useState({ label: "", tip: "text", moznosti: "", obvezno: false });
  const [dodajam, setDodajam] = useState(false);
  const [napaka, setNapaka] = useState("");

  const nalozi = async (slug: string) => {
    if (!slug) return setPolja([]);
    setLoading(true);
    try {
      const d = await fetch(`/api/admin/form-polja?program=${encodeURIComponent(slug)}`).then((r) => r.json());
      setPolja(d.polja || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!program && programi.length > 0) {
      setProgram(programi[0].slug);
      nalozi(programi[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programi]);

  const posodobi = async (p: FormPolje, spremembe: Partial<FormPolje>) => {
    setPolja((prev) => prev.map((x) => (x.id === p.id ? { ...x, ...spremembe } : x)));
    await fetch("/api/admin/form-polja", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, ...spremembe, moznosti: spremembe.moznosti ?? p.moznosti }),
    });
  };

  const premakni = async (i: number, smer: -1 | 1) => {
    const j = i + smer;
    if (j < 0 || j >= polja.length) return;
    const nova = [...polja];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    setPolja(nova);
    await Promise.all(
      nova.map((p, idx) =>
        fetch("/api/admin/form-polja", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: p.id, vrstni_red: idx, moznosti: p.moznosti }),
        })
      )
    );
  };

  const izbrisi = async (p: FormPolje) => {
    if (!confirm(`Izbrišem polje "${p.label}"?`)) return;
    setPolja((prev) => prev.filter((x) => x.id !== p.id));
    await fetch(`/api/admin/form-polja?id=${p.id}`, { method: "DELETE" });
  };

  const dodaj = async () => {
    if (!novo.label.trim()) return;
    setDodajam(true);
    setNapaka("");
    try {
      const res = await fetch("/api/admin/form-polja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program_slug: program,
          label: novo.label.trim(),
          tip: novo.tip,
          moznosti: novo.tip === "select" ? novo.moznosti : null,
          obvezno: novo.obvezno,
        }),
      });
      const d = await res.json();
      if (!res.ok) setNapaka(d.error || "Napaka.");
      else {
        setNovo({ label: "", tip: "text", moznosti: "", obvezno: false });
        nalozi(program);
      }
    } finally {
      setDodajam(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-brand-navy">Polja prijavnice</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Za vsak program nastavi, katera polja so vidna, katera obvezna, in dodaj svoja polja
            (npr. alergije vklopiš pri smučanju, pri plavanju pa skriješ).
          </p>
        </div>
        <select
          value={program}
          onChange={(e) => {
            setProgram(e.target.value);
            nalozi(e.target.value);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange"
        >
          {programi.map((p) => (
            <option key={p.slug} value={p.slug}>{p.naziv}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <Loader2 size={28} className="animate-spin text-brand-orange mx-auto" />
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-100">
            {polja.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 px-6 py-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => premakni(i, -1)} disabled={i === 0} className="text-slate-300 hover:text-brand-navy disabled:opacity-30">
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => premakni(i, 1)} disabled={i === polja.length - 1} className="text-slate-300 hover:text-brand-navy disabled:opacity-30">
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-brand-navy text-sm truncate">
                    {p.label}
                    {!p.sistemsko && (
                      <span className="ml-2 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">PO MERI</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {tipi.find((t) => t.value === p.tip)?.label || p.tip}
                    {p.tip === "select" && p.moznosti ? ` · ${p.moznosti}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => posodobi(p, { obvezno: !p.obvezno })}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    p.obvezno ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                  }`}
                  title="Ali je polje obvezno?"
                >
                  <Asterisk size={11} /> {p.obvezno ? "Obvezno" : "Neobvezno"}
                </button>
                <button
                  onClick={() => posodobi(p, { viden: !p.viden })}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    p.viden ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
                  }`}
                  title="Ali je polje na prijavnici?"
                >
                  {p.viden ? <Eye size={11} /> : <EyeOff size={11} />} {p.viden ? "Vidno" : "Skrito"}
                </button>
                {!p.sistemsko && (
                  <button onClick={() => izbrisi(p)} className="text-slate-300 hover:text-red-600" title="Izbriši polje">
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Novo polje */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Dodaj svoje polje</div>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={novo.label}
                onChange={(e) => setNovo({ ...novo, label: e.target.value })}
                placeholder="Naziv polja (npr. Velikost majice)"
                className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-orange"
              />
              <select
                value={novo.tip}
                onChange={(e) => setNovo({ ...novo, tip: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white outline-none"
              >
                {tipi.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {novo.tip === "select" && (
                <input
                  value={novo.moznosti}
                  onChange={(e) => setNovo({ ...novo, moznosti: e.target.value })}
                  placeholder="Možnosti, ločene z vejico (S, M, L)"
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                />
              )}
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={novo.obvezno}
                  onChange={(e) => setNovo({ ...novo, obvezno: e.target.checked })}
                  className="w-4 h-4 accent-brand-orange"
                />
                Obvezno
              </label>
              <button
                onClick={dodaj}
                disabled={dodajam || !novo.label.trim()}
                className="inline-flex items-center gap-1.5 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {dodajam ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Dodaj
              </button>
            </div>
            {napaka && <p className="text-xs text-red-600 mt-2">{napaka}</p>}
          </div>
        </>
      )}
    </div>
  );
}

function Bliznjica({
  href,
  icon: Icon,
  naslov,
  opis,
}: {
  href: string;
  icon: any;
  naslov: string;
  opis: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-slate-200/70 p-5 hover:border-brand-orange hover:shadow-sm transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      <div className="font-bold text-brand-navy flex items-center gap-1">
        {naslov}
        <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-xs text-slate-500 mt-1">{opis}</p>
    </Link>
  );
}
