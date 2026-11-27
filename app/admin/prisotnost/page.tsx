"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Trash2,
  Save,
  AlertCircle,
  Lock,
  Pencil,
  ChevronDown,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { IskalnikOtrok, StarsVrstica, ustrezaIskanju, PodatkiStarsa } from "@/components/admin/Starsi";

type Program = { id: number; slug: string; naziv: string };
type Termin = { id: number; program_slug: string; naziv: string; lokacija: string | null; dan: string | null; ura: string | null };
type Skupina = Termin & {
  aktiven: boolean;
  datum_od: string | null;
  datum_do: string | null;
  st_otrok: number;
  st_vadb: number;
  zadnja_vadba: string | null;
};
type Srecanje = {
  id: number;
  datum: string;
  ucitelji: string;
  trajanje_min: number;
  opomba: string | null;
  zaklenjeno?: boolean;
  zaklene_se?: string | null;
};
type Vrstica = {
  prijava_id: number;
  otrok_ime: string;
  otrok_priimek: string;
  prisoten: boolean;
  gost: boolean;
  maticni_termin_id: number | null;
} & PodatkiStarsa;
type Ucitelj = { id: number; ime: string };
type Povzetek = { prijava_id: number; otrok_ime: string; otrok_priimek: string; skupaj: number; prisoten: number } & PodatkiStarsa;
type NajdenOtrok = { id: number; otrok_ime: string; otrok_priimek: string; termin_id: number | null; termin: string | null; program: string } & PodatkiStarsa;

const danes = () => new Date().toLocaleDateString("sv-SE");
const slDatum = (d: string) =>
  new Date(d).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });
const casZaklepa = (d: string) =>
  new Date(d).toLocaleString("sl-SI", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const kratekDatum = (d: string) =>
  new Date(d).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit" });

// Današnji dan v tednu (kot ga vpisujemo pri skupinah: "Ponedeljek", "Sobota" ...)
const DNEVI_TEDNA = ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"];
const danesDan = () => DNEVI_TEDNA[new Date().getDay()];
const jeDanes = (dan?: string | null) =>
  !!dan && dan.toLowerCase().replace(/[^a-zčšž]/g, "").startsWith(danesDan().toLowerCase().slice(0, 3));

const IMENA_MESECEV = ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"];
const imeMeseca = (m: string) => `${IMENA_MESECEV[parseInt(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
// Meseci, v katerih so bile vadbe (najnovejši prvi) + tekoči mesec
const meseciVadb = (sr: { datum: string }[]) => {
  const set = new Set(sr.map((x) => x.datum.slice(0, 7)));
  set.add(new Date().toLocaleDateString("sv-SE").slice(0, 7));
  return Array.from(set).sort().reverse();
};

export default function PrisotnostPage() {
  const [skupine, setSkupine] = useState<Skupina[]>([]);
  const [programi, setProgrami] = useState<Program[]>([]);
  const [termini, setTermini] = useState<Termin[]>([]);
  const [ucitelji, setUcitelji] = useState<Ucitelj[]>([]);
  const [nalagamPregled, setNalagamPregled] = useState(true);

  const [filterProgram, setFilterProgram] = useState("");
  const [samoZOtroki, setSamoZOtroki] = useState(true);
  const [tudiPretekle, setTudiPretekle] = useState(false);

  // Izbrana skupina (null = pregled kartic)
  const [izbrana, setIzbrana] = useState<Skupina | null>(null);
  const [datum, setDatum] = useState(danes());
  const [srecanja, setSrecanja] = useState<Srecanje[]>([]);
  const [srecanje, setSrecanje] = useState<Srecanje | null>(null);
  const [vrstice, setVrstice] = useState<Vrstica[]>([]);
  const [povzetek, setPovzetek] = useState<Povzetek[]>([]);
  const [zavihek, setZavihek] = useState<"vadba" | "povzetek">("vadba");
  // % prisotnosti po mesecih ("" = vse vadbe); privzeto tekoči mesec
  const [mesec, setMesec] = useState<string>(() => new Date().toLocaleDateString("sv-SE").slice(0, 7));
  const mesecRef = useRef(mesec);
  mesecRef.current = mesec;
  const izberiMesec = async (m: string) => {
    setMesec(m);
    mesecRef.current = m;
    if (!izbrana) return;
    const d = await fetch(`/api/prisotnost?povzetek=${izbrana.id}&mesec=${m}`).then((r) => r.json());
    setPovzetek(d.povzetek || []);
  };

  const [nalagam, setNalagam] = useState(false);
  const [novUcitelj, setNovUcitelj] = useState("");
  const [premik, setPremik] = useState<Vrstica | null>(null);
  const [spremenjeno, setSpremenjeno] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const [shranjeno, setShranjeno] = useState(false);
  const [dodajOtroka, setDodajOtroka] = useState(false);
  const [jeAdmin, setJeAdmin] = useState(false);
  const [iskanje, setIskanje] = useState("");
  const [iskanjeSkupine, setIskanjeSkupine] = useState("");
  const [urediSeznam, setUrediSeznam] = useState(false);
  const [urejanUcitelj, setUrejanUcitelj] = useState<Ucitelj | null>(null);
  const [vsiOtroci, setVsiOtroci] = useState<NajdenOtrok[] | null>(null);

  // Iskanje otroka čez vse skupine — seznam prijav se naloži ob prvem iskanju
  useEffect(() => {
    if (iskanje.trim().length < 2 || vsiOtroci) return;
    fetch("/api/prijave")
      .then((r) => r.json())
      .then((d) => setVsiOtroci(d.prijave || []));
  }, [iskanje, vsiOtroci]);

  const najdeni = useMemo(
    () =>
      iskanje.trim().length < 2 || !vsiOtroci
        ? []
        : vsiOtroci.filter((o) => ustrezaIskanju(o, iskanje)).slice(0, 30),
    [iskanje, vsiOtroci]
  );

  // Zaklenjeno vadbo (24 ur po vadbi) lahko ureja samo admin, ostali jo le vidijo.
  const zaklenjeno = !!srecanje?.zaklenjeno;
  const urejanje = !zaklenjeno || jeAdmin;

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

  // Povezava /admin/prisotnost?skupina=ID (npr. iz "Skupine in ekipe") odpre skupino takoj
  const [samodejno, setSamodejno] = useState(true);
  useEffect(() => {
    if (!samodejno || nalagamPregled || izbrana) return;
    setSamodejno(false);
    const id = Number(new URLSearchParams(window.location.search).get("skupina") || 0);
    const s = id && skupine.find((x) => x.id === id);
    if (s) odpriSkupino(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nalagamPregled, skupine]);

  const programNaziv = (slug: string) => programi.find((p) => p.slug === slug)?.naziv || slug;

  // Skupina je aktualna, dokler ji ne poteče "datum do".
  // Stikalo SKRIT/PRIJAVNICA (aktiven) pomeni samo vidnost na prijavnici — tu se ne upošteva.
  const jeAktualna = (s: Skupina) => {
    if (!s.datum_do) return true;
    const konec = new Date(s.datum_do);
    konec.setHours(23, 59, 59);
    return konec >= new Date();
  };

  const prikazane = useMemo(
    () =>
      skupine
        .filter((s) => !filterProgram || s.program_slug === filterProgram)
        .filter((s) => !samoZOtroki || s.st_otrok > 0)
        .filter((s) => tudiPretekle || jeAktualna(s)),
    [skupine, filterProgram, samoZOtroki, tudiPretekle]
  );

  const preteklih = skupine.filter((s) => !jeAktualna(s)).length;

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
      fetch(`/api/prisotnost?povzetek=${s.id}&mesec=${mesecRef.current}`).then((r) => r.json()),
    ]);
    setSrecanja(sr.srecanja || []);
    setJeAdmin(!!sr.admin);
    setPovzetek(pv.povzetek || []);
    // Če današnja vadba že obstaja, jo odpri takoj (manj klikov za učitelja)
    const danasnja = (sr.srecanja || []).find((x: Srecanje) => x.datum.slice(0, 10) === danes());
    if (danasnja) {
      setSrecanje(danasnja);
      await naloziVrstice(danasnja.id);
    }
  };

  const nazaj = () => {
    if (!potrdiOpustitev()) return;
    setIzbrana(null);
    setSrecanje(null);
    setIskanjeSkupine("");
    naloziPregled();
  };

  const naloziVrstice = async (srecanje_id: number) => {
    const d = await fetch(`/api/prisotnost?srecanje=${srecanje_id}`).then((r) => r.json());
    setVrstice(d.prisotnost || []);
    setJeAdmin(!!d.admin);
    setSrecanje((s) =>
      s && s.id === srecanje_id ? { ...s, zaklenjeno: !!d.zaklenjeno, zaklene_se: d.zaklene_se || null } : s
    );
    setSpremenjeno(false);
    setShranjeno(false);
  };

  const odpriVadbo = async (zaDatum: string = datum) => {
    if (!izbrana || !zaDatum) return;
    setNalagam(true);
    try {
      const r = await fetch("/api/prisotnost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program_slug: izbrana.program_slug, termin_id: izbrana.id, datum: zaDatum }),
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

  const potrdiOpustitev = () =>
    !spremenjeno || confirm("Imaš neshranjene spremembe. Jih zavržem?");

  const odpriObstojece = async (s: Srecanje) => {
    if (!potrdiOpustitev()) return;
    setSrecanje(s);
    setDatum(s.datum.slice(0, 10));
    await naloziVrstice(s.id);
  };

  // Kljukica in glava se spreminjata samo lokalno — v bazo gre šele ob gumbu Shrani.
  const kljukica = (v: Vrstica) => {
    if (!urejanje) return;
    setVrstice((vs) => vs.map((x) => (x.prijava_id === v.prijava_id ? { ...x, prisoten: !x.prisoten } : x)));
    setSpremenjeno(true);
    setShranjeno(false);
  };

  const oznaciVse = (prisoten: boolean) => {
    if (!urejanje) return;
    setVrstice((vs) => vs.map((x) => ({ ...x, prisoten })));
    setSpremenjeno(true);
    setShranjeno(false);
  };

  const shrani = async () => {
    if (!srecanje) return;
    setShranjujem(true);
    try {
      const res = await fetch("/api/prisotnost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          akcija: "shrani",
          srecanje_id: srecanje.id,
          ucitelji: srecanje.ucitelji,
          trajanje_min: srecanje.trajanje_min,
          opomba: srecanje.opomba,
          prisotnost: vrstice.map((v) => ({ prijava_id: v.prijava_id, prisoten: v.prisoten })),
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        alert(e.error || "Napaka pri shranjevanju.");
        await naloziVrstice(srecanje.id);
        return;
      }
      setSpremenjeno(false);
      setShranjeno(true);
      setTimeout(() => setShranjeno(false), 3000);
      if (izbrana) {
        const [sr, pv] = await Promise.all([
          fetch(`/api/prisotnost?termin=${izbrana.id}`).then((r) => r.json()),
          fetch(`/api/prisotnost?povzetek=${izbrana.id}&mesec=${mesecRef.current}`).then((r) => r.json()),
        ]);
        setSrecanja(sr.srecanja || []);
        setPovzetek(pv.povzetek || []);
      }
    } finally {
      setShranjujem(false);
    }
  };

  const shraniGlavo = (spr: Partial<Srecanje>) => {
    if (!srecanje || !urejanje) return;
    setSrecanje({ ...srecanje, ...spr });
    setSpremenjeno(true);
    setShranjeno(false);
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

  // Po popravku/izbrisu učitelja osveži seznam in odprto vadbo
  const poUrejanjuUcitelja = async (staro: string, novo: string | null) => {
    const u = await fetch("/api/ucitelji").then((r) => r.json());
    setUcitelji(u.ucitelji || []);
    if (srecanje && izbraniUcitelji.includes(staro)) {
      const nov = izbraniUcitelji
        .map((x) => (x === staro ? novo : x))
        .filter((x, i, a): x is string => !!x && a.indexOf(x) === i);
      if (novo) {
        // Ime je na strežniku že popravljeno, zato samo posodobi prikaz
        setSrecanje({ ...srecanje, ucitelji: nov.join(";") });
        setSrecanja((ss) => ss.map((x) => (x.id === srecanje.id ? { ...x, ucitelji: nov.join(";") } : x)));
      } else {
        shraniGlavo({ ucitelji: nov.join(";") });
      }
    }
    setUrejanUcitelj(null);
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
      const d = await fetch(`/api/prisotnost?povzetek=${izbrana.id}&mesec=${mesecRef.current}`).then((r) => r.json());
      setPovzetek(d.povzetek || []);
    }
  };

  const izbrisiVadbo = async () => {
    if (!srecanje || !izbrana) return;
    if (!confirm(`Izbrišem vadbo ${slDatum(srecanje.datum)}? Prisotnost te vadbe bo izgubljena.`)) return;
    const res = await fetch(`/api/prisotnost?srecanje=${srecanje.id}`, { method: "DELETE" });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Brisanje ni uspelo.");
      return;
    }
    setSrecanje(null);
    setVrstice([]);
    const [sr, pv] = await Promise.all([
      fetch(`/api/prisotnost?termin=${izbrana.id}`).then((r) => r.json()),
      fetch(`/api/prisotnost?povzetek=${izbrana.id}&mesec=${mesecRef.current}`).then((r) => r.json()),
    ]);
    setSrecanja(sr.srecanja || []);
    setPovzetek(pv.povzetek || []);
  };

  const prisotnih = vrstice.filter((v) => v.prisoten).length;
  const S = "px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange";

  // ================= PREGLED SKUPIN =================

  if (!izbrana) {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2">
              <CheckCircle2 size={26} className="text-brand-orange" /> Prisotnost
            </h1>
            <p className="text-sm text-slate-600 mt-1">Tapni svojo skupino in označi otroke.</p>
          </div>
          <Link
            href={`/admin/prisotnost/skupine${filterProgram ? `?program=${filterProgram}` : ""}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy hover:border-brand-orange"
          >
            <Settings2 size={15} /> Skupine in ekipe
          </Link>
        </div>

        {/* Danes na sporedu — skupine, ki imajo danes vadbo */}
        {!nalagamPregled && skupine.some((x) => jeDanes(x.dan) && x.st_otrok > 0 && jeAktualna(x)) && (
          <div className="mb-5">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-orange">Danes · {danesDan()}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {skupine
                .filter((x) => jeDanes(x.dan) && x.st_otrok > 0 && jeAktualna(x))
                .map((x) => (
                  <button
                    key={x.id}
                    onClick={() => { setIskanjeSkupine(""); odpriSkupino(x); }}
                    className="flex items-center gap-3 rounded-2xl bg-brand-navy px-4 py-3.5 text-left text-white hover:bg-[#0B1F3A]"
                  >
                    <CheckCircle2 size={22} className="shrink-0 text-brand-orange" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{x.naziv}</span>
                      <span className="block truncate text-xs text-white/70">{[programNaziv(x.program_slug), x.ura].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="text-sm font-bold">{x.st_otrok}</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <IskalnikOtrok vrednost={iskanje} onChange={setIskanje} />
        </div>

        {iskanje.trim().length >= 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/70 mb-5 overflow-hidden">
            {!vsiOtroci ? (
              <div className="py-8 text-center">
                <Loader2 size={24} className="animate-spin text-brand-orange mx-auto" />
              </div>
            ) : najdeni.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Ni otroka, ki bi ustrezal iskanju.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {najdeni.map((o) => {
                  const sk = skupine.find((s) => s.id === o.termin_id);
                  return (
                    <li key={o.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-brand-navy">
                          {o.otrok_ime} {o.otrok_priimek}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {[programNaziv(o.program), sk?.naziv || o.termin].filter(Boolean).join(" · ") || "Brez skupine"}
                        </div>
                        <StarsVrstica o={o} className="mt-0.5" />
                      </div>
                      {sk && (
                        <button
                          onClick={() => {
                            setIskanjeSkupine(`${o.otrok_ime} ${o.otrok_priimek}`);
                            setIskanje("");
                            odpriSkupino(sk);
                          }}
                          className="shrink-0 text-xs font-bold text-brand-orange hover:underline"
                        >
                          Odpri skupino →
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-5 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:w-full">
            {[{ slug: "", naziv: "Vsi programi" }, ...programi.filter((p) => skupine.some((x) => x.program_slug === p.slug && x.st_otrok > 0))].map((p) => (
              <button
                key={p.slug}
                onClick={() => setFilterProgram(p.slug)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${
                  filterProgram === p.slug ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {p.naziv}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={samoZOtroki}
              onChange={(e) => setSamoZOtroki(e.target.checked)}
              className="w-4 h-4 accent-brand-orange"
            />
            <span className="text-sm text-slate-700">Aktualni tečaji</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tudiPretekle}
              onChange={(e) => setTudiPretekle(e.target.checked)}
              className="w-4 h-4 accent-brand-orange"
            />
            <span className="text-sm text-slate-700">
              Pretekli tečaji{preteklih > 0 ? ` (${preteklih})` : ""}
            </span>
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
                    onClick={() => {
                      setIskanjeSkupine("");
                      odpriSkupino(s);
                    }}
                    className="text-left bg-white rounded-2xl border border-slate-200/70 p-5 hover:border-brand-orange hover:shadow-lg hover:shadow-brand-navy/5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-brand-navy leading-snug">{s.naziv}</h3>
                        {!jeAktualna(s) && (
                          <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            ZAKLJUČENO{s.datum_do ? ` · ${slDatum(s.datum_do)}` : ""}
                          </span>
                        )}
                      </div>
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

      {!(srecanje && srecanje.datum.slice(0, 10) === danes()) && (
        <button
          onClick={() => { setDatum(danes()); odpriVadbo(danes()); }}
          disabled={nalagam}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-brand-orange/30 disabled:opacity-50"
        >
          {nalagam ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={20} />}
          Današnja vadba · {slDatum(danes())}
        </button>
      )}
      <details className="mb-4 rounded-2xl border border-slate-200/70 bg-white">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-600">
          <CalendarDays size={14} className="mr-1.5 inline -mt-0.5" /> Vadba na drug datum <ChevronDown size={14} className="inline" />
        </summary>
        <div className="flex gap-2 px-4 pb-4">
          <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className={`${S} flex-1`} />
          <button
            onClick={() => odpriVadbo()}
            disabled={!datum || nalagam}
            className="inline-flex items-center justify-center gap-2 bg-brand-navy text-white px-4 rounded-lg text-sm font-bold disabled:opacity-50"
          >
            <Plus size={16} /> Odpri
          </button>
        </div>
      </details>

      <div className="flex gap-2 mb-4">
        {([
          ["vadba", "Vadba"],
          ["povzetek", "% prisotnosti"],
        ] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setZavihek(v)}
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
              {s.zaklenjeno && <Lock size={10} className="inline mr-1 -mt-0.5" />}
              {slDatum(s.datum)}
            </button>
          ))}
        </div>
      )}

      {zavihek === "vadba" && !srecanje && (
        <div className="bg-white rounded-2xl border border-slate-200/70 py-14 text-center text-sm text-slate-400">
          Tapni <strong className="text-slate-600">Današnja vadba</strong> zgoraj ali izberi enega od
          datumov zgoraj.
        </div>
      )}

      {zavihek === "vadba" && srecanje && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-extrabold text-brand-navy">Vadba {slDatum(srecanje.datum)}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">
                <Users size={14} className="inline mr-1" />
                {prisotnih} / {vrstice.length} prisotnih
              </span>
              {urejanje && (
                <button
                  onClick={izbrisiVadbo}
                  title="Izbriši to vadbo"
                  className="p-2 text-slate-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {zaklenjeno && (
            <div
              className={`flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-semibold ${
                jeAdmin ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              <Lock size={16} className="shrink-0 mt-0.5" />
              <span>
                {jeAdmin
                  ? "Vadba je zaklenjena. Kot admin jo lahko še vedno urejaš."
                  : "Vadba je zaklenjena (minilo je več kot 24 ur). Prisotnost je samo za ogled — za popravek se obrni na admina."}
              </span>
            </div>
          )}
          {!zaklenjeno && srecanje.zaklene_se && (
            <p className="text-xs text-slate-400 mb-4 -mt-2">
              <Lock size={11} className="inline mr-1 -mt-0.5" />
              Urejanje se zaklene {casZaklepa(srecanje.zaklene_se)}.
            </p>
          )}

          <details className="mb-4 rounded-xl border border-slate-200/70 bg-slate-50/60" open={izbraniUcitelji.length === 0}>
            <summary className="cursor-pointer list-none px-3 py-2.5 text-sm">
              <span className="font-semibold text-slate-600">Učitelji: </span>
              <span className="font-bold text-brand-navy">{izbraniUcitelji.join(", ") || "ni izbranih"}</span>
              <span className="text-slate-400"> · {srecanje.trajanje_min} min</span>
              <ChevronDown size={14} className="ml-1 inline text-slate-400" />
            </summary>
          <div className="grid sm:grid-cols-[1fr_auto] gap-4 px-3 pb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Učitelji na tej vadbi
                <a href="/admin/ure" className="ml-2 font-bold text-brand-orange hover:underline">
                  evidenca ur →
                </a>
                {urejanje && (
                  <button
                    type="button"
                    onClick={() => setUrediSeznam(!urediSeznam)}
                    className={`ml-3 inline-flex items-center gap-1 font-bold hover:underline ${
                      urediSeznam ? "text-green-700" : "text-slate-500"
                    }`}
                  >
                    <Pencil size={11} /> {urediSeznam ? "Končano" : "Popravi imena"}
                  </button>
                )}
              </label>
              {urediSeznam && urejanje && (
                <p className="text-[11px] text-slate-500 mb-2">Klikni ime, da ga popraviš ali izbrišeš.</p>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                {!urejanje && izbraniUcitelji.length === 0 && (
                  <span className="text-xs text-slate-400">Ni vpisanih učiteljev.</span>
                )}
                {ucitelji
                  .filter((u) => urejanje || izbraniUcitelji.includes(u.ime))
                  .map((u) => (
                  <button
                    key={u.id}
                    disabled={!urejanje}
                    onClick={() => (urediSeznam ? setUrejanUcitelj(u) : preklopiUcitelja(u.ime))}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border ${
                      urediSeznam
                        ? "bg-amber-50 text-amber-900 border-amber-300 border-dashed hover:border-amber-500"
                        : izbraniUcitelji.includes(u.ime)
                        ? "bg-brand-navy text-white border-brand-navy"
                        : "bg-white text-slate-600 border-slate-200 hover:border-brand-navy"
                    }`}
                  >
                    {urediSeznam && <Pencil size={10} />}
                    {u.ime}
                  </button>
                ))}
              </div>
              {urejanje && (
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
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                <Clock size={12} className="inline mr-1" /> Trajanje (min)
              </label>
              <input
                type="number"
                value={srecanje.trajanje_min}
                readOnly={!urejanje}
                onChange={(e) => shraniGlavo({ trajanje_min: parseInt(e.target.value) || 60 })}
                className={`${S} w-28`}
              />
            </div>
          </div>
          </details>

          <div className="border-t border-slate-100 pt-4">
            {vrstice.length > 5 && (
              <IskalnikOtrok vrednost={iskanjeSkupine} onChange={setIskanjeSkupine} className="mb-3" />
            )}
            {vrstice.length > 0 && urejanje && (
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => oznaciVse(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-brand-navy hover:border-green-400"
                >
                  Vsi prisotni
                </button>
                <button
                  onClick={() => oznaciVse(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:border-slate-400"
                >
                  Počisti
                </button>
              </div>
            )}

            {vrstice.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Na ta termin ni prijavljenih otrok.</p>
            ) : (
              <ul className="space-y-1">
                {vrstice.filter((v) => ustrezaIskanju(v, iskanjeSkupine)).map((v) => (
                  <li
                    key={v.prijava_id}
                    onClick={() => kljukica(v)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3.5 border-2 select-none ${
                      urejanje ? "cursor-pointer" : "cursor-default"
                    } ${
                      v.prisoten
                        ? "bg-green-50 border-green-300"
                        : `bg-slate-50 border-transparent ${urejanje ? "hover:bg-slate-100" : ""}`
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={v.prisoten}
                      onChange={() => {}}
                      className="w-6 h-6 accent-green-600 shrink-0 pointer-events-none"
                    />
                    <span className="flex-1 min-w-0 font-semibold text-brand-navy text-base">
                      {v.otrok_ime} {v.otrok_priimek}
                      {v.gost && (
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          GOST
                        </span>
                      )}
                      <StarsVrstica o={v} className="mt-0.5" />
                    </span>
                    {!urejanje && (
                      <span
                        className={`text-xs font-bold ${v.prisoten ? "text-green-700" : "text-slate-400"}`}
                      >
                        {v.prisoten ? "prisoten" : "odsoten"}
                      </span>
                    )}
                    {urejanje && (
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
                    )}
                  </li>
                ))}
              </ul>
            )}

            {urejanje && (
            <button
              onClick={() => setDodajOtroka(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
            >
              <UserPlus size={15} /> Otrok je prišel iz druge skupine (samo danes)
            </button>
            )}
          </div>

          {/* Shranjevanje */}
          {urejanje && (
          <div className="sticky bottom-16 lg:bottom-0 z-10 -mx-5 -mb-5 mt-5 px-5 py-4 bg-white border-t border-slate-200 rounded-b-2xl flex flex-wrap items-center gap-3">
            <button
              onClick={shrani}
              disabled={!spremenjeno || shranjujem}
              className="inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-5 py-3 rounded-lg text-sm font-bold disabled:opacity-40 w-full sm:w-auto"
            >
              {shranjujem ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {shranjujem ? "Shranjujem..." : "Shrani"}
            </button>

            {spremenjeno && !shranjujem && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <AlertCircle size={15} /> Neshranjene spremembe
              </span>
            )}
            {shranjeno && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <CheckCircle2 size={15} /> Shranjeno
              </span>
            )}
            {!spremenjeno && !shranjeno && (
              <span className="text-sm text-slate-400">Vse je shranjeno.</span>
            )}
          </div>
          )}
        </div>
      )}

      {zavihek === "povzetek" && (
        <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
          {/* Izbira meseca — za obračun plačil po mesecih */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 p-3">
            {[...meseciVadb(srecanja), ""].map((m) => (
              <button
                key={m || "vse"}
                onClick={() => izberiMesec(m)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${
                  mesec === m ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {m ? imeMeseca(m) : "Vse vadbe"}
              </button>
            ))}
          </div>
          {povzetek.length > 5 && (
            <div className="p-3 border-b border-slate-100">
              <IskalnikOtrok vrednost={iskanjeSkupine} onChange={setIskanjeSkupine} />
            </div>
          )}
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
                {povzetek.filter((p) => ustrezaIskanju(p, iskanjeSkupine)).map((p) => {
                  const odst = p.skupaj > 0 ? Math.round((p.prisoten / p.skupaj) * 100) : 0;
                  return (
                    <tr key={p.prijava_id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-semibold text-brand-navy">
                        {p.otrok_ime} {p.otrok_priimek}
                        <StarsVrstica o={p} className="mt-0.5" />
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

      {urejanUcitelj && (
        <UrediUciteljaModal
          ucitelj={urejanUcitelj}
          onClose={() => setUrejanUcitelj(null)}
          onKoncano={poUrejanjuUcitelja}
        />
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
            setSpremenjeno(true);
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

function UrediUciteljaModal({
  ucitelj,
  onClose,
  onKoncano,
}: {
  ucitelj: { id: number; ime: string };
  onClose: () => void;
  onKoncano: (staro: string, novo: string | null) => void;
}) {
  const [ime, setIme] = useState(ucitelj.ime);
  const [delam, setDelam] = useState(false);

  const shrani = async () => {
    const novo = ime.trim();
    if (!novo || novo === ucitelj.ime) return onClose();
    setDelam(true);
    const r = await fetch("/api/ucitelji", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ucitelj.id, ime: novo }),
    });
    setDelam(false);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      return alert(e.error || "Napaka pri shranjevanju.");
    }
    onKoncano(ucitelj.ime, novo);
  };

  const izbrisi = async () => {
    if (!confirm(`Izbrišem ${ucitelj.ime} s seznama učiteljev? Ure na preteklih vadbah ostanejo.`)) return;
    setDelam(true);
    await fetch(`/api/ucitelji?id=${ucitelj.id}`, { method: "DELETE" });
    setDelam(false);
    onKoncano(ucitelj.ime, null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-extrabold text-brand-navy">Popravi učitelja</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Ime in priimek</label>
        <input
          autoFocus
          value={ime}
          onChange={(e) => setIme(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && shrani()}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-orange mb-2"
        />
        <p className="text-[11px] text-slate-500 mb-4">
          Popravek velja tudi za vse pretekle vadbe in izplačila, zato ure ostanejo skupaj.
        </p>
        <button
          onClick={shrani}
          disabled={delam}
          className="w-full bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {delam ? "Shranjujem..." : "Shrani"}
        </button>
        <button
          onClick={izbrisi}
          disabled={delam}
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={14} /> Izbriši s seznama
        </button>
      </div>
    </div>
  );
}
