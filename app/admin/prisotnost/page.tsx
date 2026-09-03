"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  Users,
  Clock,
  Trash2,
  UserPlus,
  ArrowRightLeft,
  Plus,
  X,
  Percent,
} from "lucide-react";

type Program = { id: number; slug: string; naziv: string };
type Termin = { id: number; program_slug: string; naziv: string; lokacija: string | null; dan: string | null; ura: string | null };
type Srecanje = { id: number; datum: string; ucitelji: string; trajanje_min: number; opomba: string | null };
type Vrstica = {
  prijava_id: number;
  otrok_ime: string;
  otrok_priimek: string;
  prisoten: boolean;
  gost: boolean;
  maticni_termin_id: number | null;
};
type Ucitelj = { id: number; ime: string };
type Povzetek = { prijava_id: number; otrok_ime: string; otrok_priimek: string; skupaj: number; prisoten: number };

const danes = () => new Date().toISOString().slice(0, 10);
const slDatum = (d: string) => new Date(d).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function PrisotnostPage() {
  const [programi, setProgrami] = useState<Program[]>([]);
  const [termini, setTermini] = useState<Termin[]>([]);
  const [ucitelji, setUcitelji] = useState<Ucitelj[]>([]);

  const [program, setProgram] = useState("");
  const [terminId, setTerminId] = useState<number | null>(null);
  const [datum, setDatum] = useState(danes());

  const [srecanja, setSrecanja] = useState<Srecanje[]>([]);
  const [srecanje, setSrecanje] = useState<Srecanje | null>(null);
  const [vrstice, setVrstice] = useState<Vrstica[]>([]);
  const [povzetek, setPovzetek] = useState<Povzetek[]>([]);

  const [nalagam, setNalagam] = useState(false);
  const [zavihek, setZavihek] = useState<"vadba" | "povzetek" | "ure">("vadba");
  const [novUcitelj, setNovUcitelj] = useState("");
  const [premik, setPremik] = useState<Vrstica | null>(null);
  const [dodajOtroka, setDodajOtroka] = useState(false);
  const [ure, setUre] = useState<{ ime: string; srecanj: number; ure: number }[]>([]);

  // Osnovni šifranti
  useEffect(() => {
    Promise.all([
      fetch("/api/programi").then((r) => r.json()),
      fetch("/api/termini").then((r) => r.json()),
      fetch("/api/ucitelji").then((r) => r.json()),
    ]).then(([p, t, u]) => {
      setProgrami(p.programi || []);
      setTermini(t.termini || []);
      setUcitelji(u.ucitelji || []);
    });
  }, []);

  const terminiProgama = useMemo(
    () => termini.filter((t) => !program || t.program_slug === program),
    [termini, program]
  );

  // Srečanja izbranega termina
  useEffect(() => {
    if (!terminId) {
      setSrecanja([]);
      setSrecanje(null);
      setVrstice([]);
      return;
    }
    fetch(`/api/prisotnost?termin=${terminId}`)
      .then((r) => r.json())
      .then((d) => setSrecanja(d.srecanja || []));
    fetch(`/api/prisotnost?povzetek=${terminId}`)
      .then((r) => r.json())
      .then((d) => setPovzetek(d.povzetek || []));
  }, [terminId]);

  const odpriVadbo = async () => {
    if (!terminId || !datum) return;
    setNalagam(true);
    try {
      const r = await fetch("/api/prisotnost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_slug: program, termin_id: terminId, datum }),
      });
      const d = await r.json();
      setSrecanje(d.srecanje);
      await naloziVrstice(d.srecanje.id);
      const s = await fetch(`/api/prisotnost?termin=${terminId}`).then((x) => x.json());
      setSrecanja(s.srecanja || []);
    } finally {
      setNalagam(false);
    }
  };

  const naloziVrstice = async (srecanje_id: number) => {
    const d = await fetch(`/api/prisotnost?srecanje=${srecanje_id}`).then((r) => r.json());
    setVrstice(d.prisotnost || []);
  };

  const odpriObstojece = async (s: Srecanje) => {
    setSrecanje(s);
    setDatum(s.datum.slice(0, 10));
    await naloziVrstice(s.id);
  };

  const kljukica = async (v: Vrstica) => {
    if (!srecanje) return;
    setVrstice((vs) => vs.map((x) => (x.prijava_id === v.prijava_id ? { ...x, prisoten: !x.prisoten } : x)));
    await fetch("/api/prisotnost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ akcija: "kljukica", srecanje_id: srecanje.id, prijava_id: v.prijava_id, prisoten: !v.prisoten }),
    });
  };

  const shraniGlavo = async (spr: Partial<Srecanje>) => {
    if (!srecanje) return;
    const novo = { ...srecanje, ...spr };
    setSrecanje(novo);
    await fetch("/api/prisotnost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        akcija: "srecanje",
        srecanje_id: srecanje.id,
        ucitelji: novo.ucitelji,
        trajanje_min: novo.trajanje_min,
        opomba: novo.opomba,
      }),
    });
  };

  const izbraniUcitelji = (srecanje?.ucitelji || "").split(";").map((x) => x.trim()).filter(Boolean);

  const preklopiUcitelja = (ime: string) => {
    const nov = izbraniUcitelji.includes(ime)
      ? izbraniUcitelji.filter((x) => x !== ime)
      : [...izbraniUcitelji, ime];
    shraniGlavo({ ucitelji: nov.join(";") });
  };

  const dodajUcitelja = async () => {
    const ime = novUcitelj.trim();
    if (!ime) return;
    await fetch("/api/ucitelji", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ime }),
    });
    const u = await fetch("/api/ucitelji").then((r) => r.json());
    setUcitelji(u.ucitelji || []);
    setNovUcitelj("");
    if (srecanje && !izbraniUcitelji.includes(ime)) {
      shraniGlavo({ ucitelji: [...izbraniUcitelji, ime].join(";") });
    }
  };

  const premakniTrajno = async (nov_termin_id: number) => {
    if (!premik) return;
    await fetch("/api/prisotnost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ akcija: "premakni", prijava_id: premik.prijava_id, termin_id: nov_termin_id }),
    });
    setPremik(null);
    if (srecanje) await naloziVrstice(srecanje.id);
    if (terminId) {
      const d = await fetch(`/api/prisotnost?povzetek=${terminId}`).then((r) => r.json());
      setPovzetek(d.povzetek || []);
    }
  };

  const naloziUre = async () => {
    const q = program ? `&program=${program}` : "";
    const d = await fetch(`/api/prisotnost?ure=1${q}`).then((r) => r.json());
    setUre(d.ure || []);
  };

  const prisotnih = vrstice.filter((v) => v.prisoten).length;
  const S = "px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
          <CheckCircle2 size={26} className="text-brand-orange" /> Prisotnost
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Izberi program in termin, določi datum vadbe in obkljukaj prisotne otroke.
        </p>
      </div>

      {/* Izbira */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Program</label>
          <select
            value={program}
            onChange={(e) => {
              setProgram(e.target.value);
              setTerminId(null);
              setSrecanje(null);
            }}
            className={S}
          >
            <option value="">Izberi program</option>
            {programi.map((p) => (
              <option key={p.slug} value={p.slug}>{p.naziv}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Termin / skupina</label>
          <select
            value={terminId ?? ""}
            onChange={(e) => {
              setTerminId(e.target.value ? parseInt(e.target.value) : null);
              setSrecanje(null);
            }}
            className={`${S} max-w-[320px]`}
          >
            <option value="">Izberi termin</option>
            {terminiProgama.map((t) => (
              <option key={t.id} value={t.id}>
                {t.naziv}{t.lokacija ? ` — ${t.lokacija}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Datum vadbe</label>
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className={S} />
        </div>
        <button
          onClick={odpriVadbo}
          disabled={!terminId || !datum || nalagam}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {nalagam ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Odpri vadbo
        </button>
      </div>

      {terminId && (
        <div className="flex gap-2 mb-4">
          {([
            ["vadba", "Vadba"],
            ["povzetek", "% prisotnosti"],
            ["ure", "Ure učiteljev"],
          ] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setZavihek(v);
                if (v === "ure") naloziUre();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                zavihek === v ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-brand-navy border-slate-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Pretekle vadbe */}
      {terminId && zavihek === "vadba" && srecanja.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {srecanja.map((s) => (
            <button
              key={s.id}
              onClick={() => odpriObstojece(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                srecanje?.id === s.id
                  ? "bg-brand-orange text-white border-brand-orange"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-orange"
              }`}
            >
              {slDatum(s.datum)}
            </button>
          ))}
        </div>
      )}

      {/* VADBA */}
      {zavihek === "vadba" && srecanje && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-extrabold text-brand-navy">
                Vadba {slDatum(srecanje.datum)}
              </h2>
              <span className="text-sm font-semibold text-slate-600">
                <Users size={14} className="inline mr-1" />
                {prisotnih} / {vrstice.length} prisotnih
              </span>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Učitelji na tej vadbi
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ucitelji.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => preklopiUcitelja(u.ime)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        izbraniUcitelji.includes(u.ime)
                          ? "bg-brand-navy text-white border-brand-navy"
                          : "bg-white text-slate-600 border-slate-200 hover:border-brand-navy"
                      }`}
                    >
                      {u.ime}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={novUcitelj}
                    onChange={(e) => setNovUcitelj(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && dodajUcitelja()}
                    placeholder="Ime in priimek novega učitelja"
                    className={`${S} flex-1`}
                  />
                  <button
                    onClick={dodajUcitelja}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-brand-navy hover:border-brand-orange"
                  >
                    <UserPlus size={14} /> Dodaj
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  <Clock size={12} className="inline mr-1" /> Trajanje (min)
                </label>
                <input
                  type="number"
                  value={srecanje.trajanje_min}
                  onChange={(e) => shraniGlavo({ trajanje_min: parseInt(e.target.value) || 60 })}
                  className={`${S} w-28`}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              {vrstice.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  Na ta termin ni prijavljenih otrok.
                </p>
              ) : (
                <ul className="space-y-1">
                  {vrstice.map((v) => (
                    <li
                      key={v.prijava_id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${
                        v.prisoten ? "bg-green-50 border-green-200" : "bg-slate-50 border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={v.prisoten}
                        onChange={() => kljukica(v)}
                        className="w-5 h-5 accent-green-600 shrink-0"
                      />
                      <span className="flex-1 font-semibold text-brand-navy text-sm">
                        {v.otrok_ime} {v.otrok_priimek}
                        {v.gost && (
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            GOST
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => setPremik(v)}
                        title="Trajno prestavi v drugo skupino"
                        className="p-2 text-slate-400 hover:text-brand-orange"
                      >
                        <ArrowRightLeft size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => setDodajOtroka(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
              >
                <UserPlus size={15} /> Otrok je prišel iz druge skupine (samo danes)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POVZETEK */}
      {zavihek === "povzetek" && (
        <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
          {povzetek.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Ni podatkov o prisotnosti.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Otrok</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Prisoten</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Vadb</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Delež</th>
                </tr>
              </thead>
              <tbody>
                {povzetek.map((p) => {
                  const odst = p.skupaj > 0 ? Math.round((p.prisoten / p.skupaj) * 100) : 0;
                  return (
                    <tr key={p.prijava_id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-semibold text-brand-navy">
                        {p.otrok_ime} {p.otrok_priimek}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.prisoten}</td>
                      <td className="px-4 py-3 text-slate-600">{p.skupaj}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            odst >= 80
                              ? "bg-green-100 text-green-800"
                              : odst >= 50
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <Percent size={11} className="inline mr-0.5" />
                          {odst}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* URE UČITELJEV */}
      {zavihek === "ure" && (
        <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
          {ure.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">Ni zabeleženih ur.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Učitelj</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Vadb</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">Ur skupaj</th>
                </tr>
              </thead>
              <tbody>
                {ure.map((u) => (
                  <tr key={u.ime} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{u.ime}</td>
                    <td className="px-4 py-3 text-slate-600">{u.srecanj}</td>
                    <td className="px-4 py-3 font-bold text-brand-navy">{u.ure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Premik otroka */}
      {premik && (
        <Izbirnik
          naslov={`Prestavi ${premik.otrok_ime} ${premik.otrok_priimek}`}
          opis="Otrok bo odslej voden v izbrani skupini. Za enkraten obisk uporabi gumb “Otrok je prišel iz druge skupine”."
          moznosti={termini
            .filter((t) => t.program_slug === program && t.id !== terminId)
            .map((t) => ({ id: t.id, label: `${t.naziv}${t.lokacija ? " — " + t.lokacija : ""}` }))}
          onIzberi={(id) => premakniTrajno(id)}
          onClose={() => setPremik(null)}
        />
      )}

      {/* Gost iz druge skupine */}
      {dodajOtroka && srecanje && (
        <GostModal
          program={program}
          terminId={terminId}
          srecanjeId={srecanje.id}
          onClose={() => setDodajOtroka(false)}
          onDodano={async () => {
            setDodajOtroka(false);
            await naloziVrstice(srecanje.id);
          }}
        />
      )}
    </div>
  );
}

function Izbirnik({
  naslov,
  opis,
  moznosti,
  onIzberi,
  onClose,
}: {
  naslov: string;
  opis?: string;
  moznosti: { id: number; label: string }[];
  onIzberi: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-extrabold text-brand-navy">{naslov}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        {opis && <p className="text-xs text-slate-600 mb-4">{opis}</p>}
        {moznosti.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">Ni drugih skupin v tem programu.</p>
        ) : (
          <ul className="space-y-2">
            {moznosti.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => onIzberi(m.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-brand-orange hover:bg-orange-50/50 text-sm font-semibold text-brand-navy"
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function GostModal({
  program,
  terminId,
  srecanjeId,
  onClose,
  onDodano,
}: {
  program: string;
  terminId: number | null;
  srecanjeId: number;
  onClose: () => void;
  onDodano: () => void;
}) {
  const [otroci, setOtroci] = useState<{ id: number; otrok_ime: string; otrok_priimek: string; termin: string | null }[]>([]);
  const [iskanje, setIskanje] = useState("");

  useEffect(() => {
    fetch(`/api/prijave?program=${program}`)
      .then((r) => r.json())
      .then((d) => setOtroci(d.prijave || []));
  }, [program]);

  const dodaj = async (prijava_id: number) => {
    await fetch("/api/prisotnost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ akcija: "gost", srecanje_id: srecanjeId, prijava_id }),
    });
    onDodano();
  };

  const najdeni = otroci.filter((o) =>
    `${o.otrok_ime} ${o.otrok_priimek}`.toLowerCase().includes(iskanje.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-extrabold text-brand-navy">Otrok iz druge skupine</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-4">
          Doda ga samo na to vadbo. Njegova matična skupina se ne spremeni.
        </p>
        <input
          value={iskanje}
          onChange={(e) => setIskanje(e.target.value)}
          placeholder="Išči otroka..."
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-orange mb-3"
        />
        <ul className="space-y-1 overflow-y-auto">
          {najdeni.slice(0, 40).map((o) => (
            <li key={o.id}>
              <button
                onClick={() => dodaj(o.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-orange-50/60 text-sm"
              >
                <span className="font-semibold text-brand-navy">
                  {o.otrok_ime} {o.otrok_priimek}
                </span>
                {o.termin && <span className="block text-xs text-slate-400">{o.termin}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
