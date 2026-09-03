"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  Users,
  Clock,
  UserPlus,
  ArrowRightLeft,
  ArrowLeft,
  Plus,
  X,
  Percent,
  MapPin,
  CalendarDays,
} from "lucide-react";

type Program = { id: number; slug: string; naziv: string };
type Termin = { id: number; program_slug: string; naziv: string; lokacija: string | null; dan: string | null; ura: string | null };
type Skupina = Termin & {
  aktiven: boolean;
  st_otrok: number;
  st_vadb: number;
  zadnja_vadba: string | null;
};
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
const slDatum = (d: string) =>
  new Date(d).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });
const kratekDatum = (d: string) =>
  new Date(d).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit" });

export default function PrisotnostPage() {
  const [skupine, setSkupine] = useState<Skupina[]>([]);
  const [programi, setProgrami] = useState<Program[]>([]);
  const [termini, setTermini] = useState<Termin[]>([]);
  const [ucitelji, setUcitelji] = useState<Ucitelj[]>([]);
  const [nalagamPregled, setNalagamPregled] = useState(true);

  const [filterProgram, setFilterProgram] = useState("");
  const [samoZOtroki, setSamoZOtroki] = useState(true);

  // Izbrana skupina (null = pregled kartic)
  const [izbrana, setIzbrana] = useState<Skupina | null>(null);
  const [datum, setDatum] = useState(danes());
  const [srecanja, setSrecanja] = useState<Srecanje[]>([]);
  const [srecanje, setSrecanje] = useState<Srecanje | null>(null);
  const [vrstice, setVrstice] = useState<Vrstica[]>([]);
  const [povzetek, setPovzetek] = useState<Povzetek[]>([]);
  const [ure, setUre] = useState<{ ime: string; srecanj: number; ure: number }[]>([]);
  const [zavihek, setZavihek] = useState<"vadba" | "povzetek" | "ure">("vadba");

  const [nalagam, setNalagam] = useState(false);
  const [novUcitelj, setNovUcitelj] = useState("");
  const [premik, setPremik] = useState<Vrstica | null>(null);
  const [dodajOtroka, setDodajOtroka] = useState(false);

  const naloziPregled = async () => {
    setNalagamPregled(true);
    try {
      const [s, p, t, u] = await Promise.all([
        fetch("/api/prisotnost?pregled=1").then((r) => r.json()),
        fetch("/api/programi").then((r) => r.json()),
        fetch("/api/termini").then((r) => r.json()),
        fetch("/api/ucitelji").then((r) => r.json()),
      ]);
      setSkupine(s.skupine || []);
      setProgrami(p.programi || []);
      setTermini(t.termini || []);
      setUcitelji(u.ucitelji || []);
    } finally {
      setNalagamPregled(false);
    }
  };

  useEffect(() => {
    naloziPregled();
  }, []);

  const programNaziv = (slug: string) => programi.find((p) => p.slug === slug)?.naziv || slug;

  const prikazane = useMemo(
    () =>
      skupine
        .filter((s) => !filterProgram || s.program_slug === filterProgram)
        .filter((s) => !samoZOtroki || s.st_otrok > 0),
    [skupine, filterProgram, samoZOtroki]
  );

  // Skupine, razvrščene po programu
  const poProgramih = useMemo(() => {
    const m: Record<string, Skupina[]> = {};
    for (const s of prikazane) {
      if (!m[s.program_slug]) m[s.program_slug] = [];
      m[s.program_slug].push(s);
    }
    return Object.entries(m);
  }, [prikazane]);

  // ---------- odpiranje skupine ----------

  const odpriSkupino = async (s: Skupina) => {
    setIzbrana(s);
    setZavihek("vadba");
    setSrecanje(null);
    setVrstice([]);
    setDatum(danes());
    const [sr, pv] = await Promise.all([
      fetch(`/api/prisotnost?termin=${s.id}`).then((r) => r.json()),
      fetch(`/api/prisotnost?povzetek=${s.id}`).then((r) => r.json()),
    ]);
    setSrecanja(sr.srecanja || []);
    setPovzetek(pv.povzetek || []);
  };

  const nazaj = () => {
    setIzbrana(null);
    setSrecanje(null);
    naloziPregled();
  };

  const naloziVrstice = async (srecanje_id: number) => {
    const d = await fetch(`/api/prisotnost?srecanje=${srecanje_id}`).then((r) => r.json());
    setVrstice(d.prisotnost || []);
  };

  const odpriVadbo = async () => {
    if (!izbrana || !datum) return;
    setNalagam(true);
    try {
      const r = await fetch("/api/prisotnost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_slug: izbrana.program_slug, termin_id: izbrana.id, datum }),
      });
      const d = await r.json();
      setSrecanje(d.srecanje);
      await naloziVrstice(d.srecanje.id);
      const s = await fetch(`/api/prisotnost?termin=${izbrana.id}`).then((x) => x.json());
      setSrecanja(s.srecanja || []);
    } finally {
      setNalagam(false);
    }
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
      body: JSON.stringify({
        akcija: "kljukica",
        srecanje_id: srecanje.id,
        prijava_id: v.prijava_id,
        prisoten: !v.prisoten,
      }),
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
    if (izbrana) {
      const d = await fetch(`/api/prisotnost?povzetek=${izbrana.id}`).then((r) => r.json());
      setPovzetek(d.povzetek || []);
    }
  };

  const naloziUre = async () => {
    const q = izbrana ? `&program=${izbrana.program_slug}` : "";
    const d = await fetch(`/api/prisotnost?ure=1${q}`).then((r) => r.json());
    setUre(d.ure || []);
  };

  const prisotnih = vrstice.filter((v) => v.prisoten).length;
  const S = "px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange";

  // ================= PREGLED SKUPIN =================

  if (!izbrana) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
            <CheckCircle2 size={26} className="text-brand-orange" /> Prisotnost
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Klikni skupino, da vpišeš prisotnost za vadbo.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-5 flex flex-wrap gap-3 items-center">
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className={S}
          >
            <option value="">Vsi programi</option>
            {programi.map((p) => (
              <option key={p.slug} value={p.slug}>{p.naziv}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={samoZOtroki}
              onChange={(e) => setSamoZOtroki(e.target.checked)}
              className="w-4 h-4 accent-brand-orange"
            />
            <span className="text-sm text-slate-700">Samo skupine s prijavljenimi otroki</span>
          </label>
        </div>

        {nalagamPregled ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : prikazane.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/70 py-16 text-center text-sm text-slate-400">
            Ni skupin za prikaz. Odkljukaj filter zgoraj, če želiš videti tudi prazne skupine.
          </div>
        ) : (
          poProgramih.map(([slug, seznam]) => (
            <div key={slug} className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                {programNaziv(slug)}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {seznam.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => odpriSkupino(s)}
                    className="text-left bg-white rounded-2xl border border-slate-200/70 p-5 hover:border-brand-orange hover:shadow-lg hover:shadow-brand-navy/5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-extrabold text-brand-navy leading-snug">{s.naziv}</h3>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
                        <Users size={12} /> {s.st_otrok}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 mb-4">
                      {s.lokacija && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-400" /> {s.lokacija}
                        </div>
                      )}
                      {(s.dan || s.ura) && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          {[s.dan, s.ura].filter(Boolean).join(" · ")}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-500">
                        {s.st_vadb > 0 ? (
                          <>
                            <CalendarDays size={12} className="inline mr-1 text-slate-400" />
                            {s.st_vadb} vadb · zadnja {s.zadnja_vadba ? kratekDatum(s.zadnja_vadba) : "—"}
                          </>
                        ) : (
                          "Še ni vadb"
                        )}
                      </span>
                      <span className="text-xs font-bold text-brand-orange">Odpri →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  // ================= ENA SKUPINA =================

  return (
    <div>
      <button
        onClick={nazaj}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-orange mb-4"
      >
        <ArrowLeft size={15} /> Vse skupine
      </button>

      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-brand-navy">{izbrana.naziv}</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          {[programNaziv(izbrana.program_slug), izbrana.lokacija, [izbrana.dan, izbrana.ura].filter(Boolean).join(" ")]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Datum vadbe</label>
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className={S} />
        </div>
        <button
          onClick={odpriVadbo}
          disabled={!datum || nalagam}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {nalagam ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Odpri vadbo
        </button>
      </div>

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

      {zavihek === "vadba" && srecanja.length > 0 && (
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

      {zavihek === "vadba" && !srecanje && (
        <div className="bg-white rounded-2xl border border-slate-200/70 py-14 text-center text-sm text-slate-400">
          Izberi datum in klikni <strong className="text-slate-600">Odpri vadbo</strong>, ali klikni enega od
          datumov zgoraj.
        </div>
      )}

      {zavihek === "vadba" && srecanje && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-extrabold text-brand-navy">Vadba {slDatum(srecanje.datum)}</h2>
            <span className="text-sm font-semibold text-slate-600">
              <Users size={14} className="inline mr-1" />
              {prisotnih} / {vrstice.length} prisotnih
            </span>
          </div>

          <div className="grid sm:grid-cols-[1fr_auto] gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Učitelji na tej vadbi</label>
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
              <p className="text-sm text-slate-400 py-6 text-center">Na ta termin ni prijavljenih otrok.</p>
            ) : (
              <ul className="space-y-1">
                {vrstice.map((v) => (
                  <li
                    key={v.prijava_id}
                    onClick={() => kljukica(v)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border cursor-pointer ${
                      v.prisoten ? "bg-green-50 border-green-200" : "bg-slate-50 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={v.prisoten}
                      onChange={() => {}}
                      className="w-5 h-5 accent-green-600 shrink-0 pointer-events-none"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setPremik(v);
                      }}
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
      )}

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
          <p className="px-4 py-3 text-xs text-slate-500 border-t border-slate-100">
            Vse vadbe programa {programNaziv(izbrana.program_slug)}, ne samo te skupine.
          </p>
        </div>
      )}

      {premik && (
        <Izbirnik
          naslov={`Prestavi ${premik.otrok_ime} ${premik.otrok_priimek}`}
          opis="Otrok bo odslej voden v izbrani skupini. Za enkraten obisk uporabi gumb “Otrok je prišel iz druge skupine”."
          moznosti={termini
            .filter((t) => t.program_slug === izbrana.program_slug && t.id !== izbrana.id)
            .map((t) => ({ id: t.id, label: `${t.naziv}${t.lokacija ? " — " + t.lokacija : ""}` }))}
          onIzberi={(id) => premakniTrajno(id)}
          onClose={() => setPremik(null)}
        />
      )}

      {dodajOtroka && srecanje && (
        <GostModal
          program={izbrana.program_slug}
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
  srecanjeId,
  onClose,
  onDodano,
}: {
  program: string;
  srecanjeId: number;
  onClose: () => void;
  onDodano: () => void;
}) {
  const [otroci, setOtroci] = useState<
    { id: number; otrok_ime: string; otrok_priimek: string; termin: string | null }[]
  >([]);
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
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] flex flex-col"
      >
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
