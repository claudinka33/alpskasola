"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  ArrowLeft,
  CalendarDays,
  Check,
  AlertCircle,
  Trash2,
  Users,
  BarChart3,
  Plus,
  Mountain,
  Pencil,
  Settings2,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Nastavitve
// ---------------------------------------------------------------------------
// Privzete možnosti — admin jih lahko spremeni v zavihku »Nastavitve«.
// v = trajna oznaka (shranjena v bazi), l = kar se izpiše. Preimenovanje spremeni le l.
type Opt = { v: string; l: string; ikona?: string };
type Moznosti = {
  ekipe: string[];
  trenerji: string[];
  tipi: Opt[];
  voznja: Opt[];
  discipline: Opt[];
  pogoji: Opt[];
};
const PRIVZETO: Moznosti = {
  ekipe: ["U8/U6", "U10/U12", "U14", "FIS"],
  trenerji: ["Claudia", "Nejc"],
  tipi: [
    { v: "trening", l: "Trening", ikona: "🎿" },
    { v: "tekma", l: "Tekma", ikona: "🏁" },
  ],
  voznja: [
    { v: "fraj", l: "Fraj" },
    { v: "proga", l: "Proga" },
  ],
  discipline: [
    { v: "VSL", l: "VSL" },
    { v: "SL", l: "SL" },
    { v: "SG", l: "Super G" },
    { v: "Freestyle", l: "Freestyle" },
  ],
  pogoji: [
    { v: "odlicni", l: "Odlični", ikona: "☀️" },
    { v: "dobri", l: "Dobri", ikona: "⛅" },
    { v: "slabi", l: "Slabi", ikona: "🌧️" },
  ],
};

const novaOznaka = (l: string) =>
  (l.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "x") +
  "-" + Date.now().toString(36).slice(-4);

type Otrok = { id: number; ime: string; ekipa: string; aktiven: boolean; letnik: number | null; skupina: string };
type Trening = {
  id: number;
  ekipa: string;
  datum: string;
  tip: string;
  voznja: string;
  discipline: string;
  pogoji: string;
  trenerji: string;
  st_prisotnih?: number;
};
type StatPodatki = {
  otroci: { id: number; ime: string; aktiven: boolean; skupina: string; letnik: number | null }[];
  treningi: { id: number; datum: string; tip: string; voznja: string; discipline: string; pogoji: string }[];
  prisotnost: { trening_id: number; otrok_id: number }[];
};

const seznam = (s: string) => s.split(";").map((x) => x.trim()).filter(Boolean);
const danes = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const DNEVI = ["ned", "pon", "tor", "sre", "čet", "pet", "sob"];
const lepDatum = (iso: string, dolg = false) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dan = DNEVI[dt.getDay()];
  return dolg
    ? `${dan.charAt(0).toUpperCase() + dan.slice(1)}, ${d}. ${m}. ${y}`
    : `${dan} ${d}. ${m}.`;
};

// Sezona: od 1. julija do 30. junija (npr. 2026/27)
const sezonaZa = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  const z = m >= 7 ? y : y - 1;
  return `${z}/${String((z + 1) % 100).padStart(2, "0")}`;
};

// Zaporedna številka dne v sezoni: »3. trening« in »5. dan na snegu«
function stevilkaDne(vsi: { datum: string; tip: string }[], datum: string, tip: string) {
  const sezona = sezonaZa(datum);
  const prej = vsi.filter((t) => sezonaZa(t.datum) === sezona && t.datum < datum);
  return {
    sezona,
    naSnegu: prej.length + 1,
    poTipu: prej.filter((t) => t.tip === tip).length + 1,
  };
}

// Otroke razdeli po podskupinah (U10, U12 deklice, U12 dečki …); brez skupine gre na konec
function poSkupinah<T extends { skupina: string; ime: string }>(seznamOtrok: T[]) {
  const m = new Map<string, T[]>();
  for (const o of seznamOtrok) {
    const k = o.skupina || "Brez skupine";
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(o);
  }
  return Array.from(m.entries())
    .sort(([a], [b]) => (a === "Brez skupine" ? 1 : b === "Brez skupine" ? -1 : a.localeCompare(b, "sl")))
    .map(([skupina, otroci]) => ({ skupina, otroci: otroci.sort((x, y) => x.ime.localeCompare(y.ime, "sl")) }));
}

const LETNIKI = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 - i); // npr. 2021 … 2012

async function api(body: any) {
  const r = await fetch("/api/ekipa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Napaka");
  return d;
}

// Velik gumb-čip za izbiro
function Cip({
  aktiven,
  onClick,
  children,
}: {
  aktiven: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition active:scale-95 ${
        aktiven
          ? "bg-brand-orange border-brand-orange text-white shadow-sm"
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function Razdelek({ naslov, children }: { naslov: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">{naslov}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Urejevalniki za zavihek »Nastavitve«
// ---------------------------------------------------------------------------
function premakni<T>(a: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= a.length) return a;
  const b = [...a];
  [b[i], b[j]] = [b[j], b[i]];
  return b;
}

function Okvir({ naslov, opomba, children, onDodaj }: { naslov: string; opomba?: string; children: React.ReactNode; onDodaj: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-4">
      <div className="text-sm font-bold text-brand-navy mb-1">{naslov}</div>
      {opomba && <p className="text-[11px] text-slate-400 mb-2">{opomba}</p>}
      <div className="space-y-2 mt-2">{children}</div>
      <button onClick={onDodaj} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-orange py-1">
        <Plus size={16} /> Dodaj
      </button>
    </div>
  );
}

function GumbiVrstice({ onGor, onDol, onBrisi }: { onGor: () => void; onDol: () => void; onBrisi: () => void }) {
  return (
    <>
      <button onClick={onGor} className="p-2 text-slate-400" title="Gor"><ArrowUp size={16} /></button>
      <button onClick={onDol} className="p-2 text-slate-400" title="Dol"><ArrowDown size={16} /></button>
      <button onClick={onBrisi} className="p-2 text-slate-300 hover:text-red-600" title="Odstrani"><X size={16} /></button>
    </>
  );
}

function UrejevalnikBesed({ naslov, opomba, vrednosti, onChange }: { naslov: string; opomba?: string; vrednosti: string[]; onChange: (v: string[]) => void }) {
  return (
    <Okvir naslov={naslov} opomba={opomba} onDodaj={() => onChange([...vrednosti, ""])}>
      {vrednosti.map((v, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            value={v}
            onChange={(e) => onChange(vrednosti.map((x, j) => (j === i ? e.target.value : x)))}
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-base outline-none focus:border-brand-orange"
          />
          <GumbiVrstice
            onGor={() => onChange(premakni(vrednosti, i, -1))}
            onDol={() => onChange(premakni(vrednosti, i, 1))}
            onBrisi={() => onChange(vrednosti.filter((_, j) => j !== i))}
          />
        </div>
      ))}
    </Okvir>
  );
}

function UrejevalnikMoznosti({ naslov, vrednosti, onChange, z_ikono }: { naslov: string; vrednosti: Opt[]; onChange: (v: Opt[]) => void; z_ikono?: boolean }) {
  const nastavi = (i: number, polja: Partial<Opt>) => onChange(vrednosti.map((x, j) => (j === i ? { ...x, ...polja } : x)));
  return (
    <Okvir naslov={naslov} onDodaj={() => onChange([...vrednosti, { v: "", l: "", ...(z_ikono ? { ikona: "" } : {}) }])}>
      {vrednosti.map((o, i) => (
        <div key={i} className="flex items-center gap-1">
          {z_ikono && (
            <input
              value={o.ikona || ""}
              onChange={(e) => nastavi(i, { ikona: e.target.value })}
              placeholder="🙂"
              className="w-12 shrink-0 px-1 py-2.5 rounded-xl border border-slate-200 text-base text-center outline-none focus:border-brand-orange"
            />
          )}
          <input
            value={o.l}
            onChange={(e) => nastavi(i, { l: e.target.value, ...(o.v ? {} : {}) })}
            onBlur={() => {
              if (!o.v && o.l.trim()) nastavi(i, { v: novaOznaka(o.l) });
            }}
            placeholder="Ime gumba"
            className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-slate-200 text-base outline-none focus:border-brand-orange"
          />
          <GumbiVrstice
            onGor={() => onChange(premakni(vrednosti, i, -1))}
            onDol={() => onChange(premakni(vrednosti, i, 1))}
            onBrisi={() => onChange(vrednosti.filter((_, j) => j !== i))}
          />
        </div>
      ))}
    </Okvir>
  );
}

// ---------------------------------------------------------------------------
export default function EkipaPage() {
  const [ekipa, setEkipa] = useState("U10/U12");
  const [pogled, setPogled] = useState<"dnevi" | "otroci" | "statistika" | "nastavitve">("dnevi");
  const [M, setM] = useState<Moznosti>(PRIVZETO);
  const [jeAdmin, setJeAdmin] = useState(false);
  const [osnutekM, setOsnutekM] = useState<Moznosti>(PRIVZETO);
  const [stanjeM, setStanjeM] = useState<"" | "shranjujem" | "shranjeno" | "napaka">("");
  const [otroci, setOtroci] = useState<Otrok[]>([]);
  const [treningi, setTreningi] = useState<Trening[]>([]);
  const [nalagam, setNalagam] = useState(true);

  // Odprt dan
  const [dan, setDan] = useState<Trening | null>(null);
  const [prisotni, setPrisotni] = useState<number[]>([]);
  const [stanje, setStanje] = useState<"" | "shranjujem" | "shranjeno" | "napaka">("");
  const [drugDatum, setDrugDatum] = useState(danes());

  // Otroci
  const [novoIme, setNovoIme] = useState("");
  const [novLetnik, setNovLetnik] = useState<number | null>(null);
  const [novaSkupina, setNovaSkupina] = useState("");
  const [urejam, setUrejam] = useState<number | null>(null);

  // Statistika
  const [stat, setStat] = useState<StatPodatki | null>(null);
  const [statSezona, setStatSezona] = useState(sezonaZa(danes()));

  const { ekipe: EKIPE, trenerji: TRENERJI, tipi: TIPI, voznja: VOZNJA, discipline: DISCIPLINE, pogoji: POGOJI } = M;

  useEffect(() => {
    try {
      const e = localStorage.getItem("ekipa-izbrana");
      if (e) setEkipa(e);
    } catch {}
    fetch("/api/ekipa?akcija=moznosti", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const m: Moznosti = { ...PRIVZETO, ...(d?.moznosti || {}) };
        setM(m);
        setOsnutekM(m);
        setJeAdmin(!!d?.admin);
      })
      .catch(() => {});
  }, []);

  const shraniNastavitve = async () => {
    // počisti prazne vrstice
    const ocisti = (a: Opt[]) =>
      a.map((o) => ({ ...o, l: o.l.trim(), v: o.v || novaOznaka(o.l) })).filter((o) => o.l);
    const m: Moznosti = {
      ekipe: osnutekM.ekipe.map((x) => x.trim()).filter(Boolean),
      trenerji: osnutekM.trenerji.map((x) => x.trim()).filter(Boolean),
      tipi: ocisti(osnutekM.tipi),
      voznja: ocisti(osnutekM.voznja),
      discipline: ocisti(osnutekM.discipline),
      pogoji: ocisti(osnutekM.pogoji),
    };
    setStanjeM("shranjujem");
    try {
      await api({ akcija: "shrani-moznosti", moznosti: m });
      setM(m);
      setOsnutekM(m);
      setStanjeM("shranjeno");
    } catch {
      setStanjeM("napaka");
    }
  };

  const nalozi = useCallback(async () => {
    setNalagam(true);
    const [o, t] = await Promise.all([
      fetch(`/api/ekipa?akcija=otroci&ekipa=${encodeURIComponent(ekipa)}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/ekipa?akcija=treningi&ekipa=${encodeURIComponent(ekipa)}`, { cache: "no-store" }).then((r) => r.json()),
    ]);
    setOtroci(Array.isArray(o) ? o : []);
    setTreningi(Array.isArray(t) ? t : []);
    setNalagam(false);
  }, [ekipa]);

  useEffect(() => {
    nalozi();
    setDan(null);
    try {
      localStorage.setItem("ekipa-izbrana", ekipa);
    } catch {}
  }, [ekipa, nalozi]);

  useEffect(() => {
    if (pogled === "statistika") {
      setStat(null);
      fetch(`/api/ekipa?akcija=statistika&ekipa=${encodeURIComponent(ekipa)}`, { cache: "no-store" })
        .then((r) => r.json())
        .then(setStat);
    }
  }, [pogled, ekipa]);

  const aktivni = useMemo(() => otroci.filter((o) => o.aktiven), [otroci]);
  const skupineEkipe = useMemo(
    () => Array.from(new Set(otroci.map((o) => o.skupina).filter(Boolean))).sort((a, b) => a.localeCompare(b, "sl")),
    [otroci]
  );

  // ---------- Dan ----------
  // Vse klike drživa lokalno; v bazo gre šele ob kliku na »Shrani«.
  const [shranjeno, setShranjeno] = useState<string>(""); // posnetek zadnjega shranjenega stanja
  const posnetek = (d: Trening | null, p: number[]) =>
    d ? JSON.stringify([d.tip, d.voznja, d.discipline, d.pogoji, d.trenerji, [...p].sort((a, b) => a - b)]) : "";
  const neshranjeno = !!dan && posnetek(dan, prisotni) !== shranjeno;

  // Opozori, če zapre zavihek z neshranjenimi kliki
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (neshranjeno) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [neshranjeno]);

  const odpri = async (datum: string) => {
    setStanje("");
    const d = await fetch(
      `/api/ekipa?akcija=dan&ekipa=${encodeURIComponent(ekipa)}&datum=${datum}`,
      { cache: "no-store" }
    ).then((r) => r.json());
    const t: Trening =
      d?.trening ||
      { id: 0, ekipa, datum, tip: TIPI[0]?.v || "trening", voznja: "", discipline: "", pogoji: "", trenerji: "" };
    const p: number[] = d?.prisotni || [];
    setDan(t);
    setPrisotni(p);
    // nov dan še ni shranjen → takoj velja kot »neshranjen«
    setShranjeno(d?.trening ? posnetek(t, p) : "nov");
    window.scrollTo({ top: 0 });
  };

  const zapriDan = () => {
    if (neshranjeno && !confirm("Nisi shranila. Zapustim brez shranjevanja?")) return;
    setDan(null);
    setStanje("");
    nalozi();
  };

  const shraniDan = async () => {
    if (!dan) return;
    setStanje("shranjujem");
    try {
      const d = await api({
        akcija: "shrani-dan",
        ekipa,
        datum: dan.datum,
        polja: { tip: dan.tip, voznja: dan.voznja, discipline: dan.discipline, pogoji: dan.pogoji, trenerji: dan.trenerji },
        prisotni,
      });
      const t = { ...dan, id: d.id };
      setDan(t);
      setShranjeno(posnetek(t, prisotni));
      setStanje("shranjeno");
    } catch {
      setStanje("napaka");
    }
  };

  const nastaviPolje = (polje: keyof Trening, vrednost: string) => {
    if (!dan) return;
    setDan({ ...dan, [polje]: vrednost });
    setStanje("");
  };

  const preklopiVSeznamu = (polje: "voznja" | "discipline" | "trenerji", v: string) => {
    if (!dan) return;
    const zdaj = seznam(dan[polje]);
    const novo = zdaj.includes(v) ? zdaj.filter((x) => x !== v) : [...zdaj, v];
    nastaviPolje(polje, novo.join(";"));
  };

  const preklopiOtroka = (id: number) => {
    setPrisotni((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setStanje("");
  };

  const vsiPrisotni = (prisoten: boolean) => {
    setPrisotni(prisoten ? aktivni.map((o) => o.id) : []);
    setStanje("");
  };

  const vsiVSkupini = (ids: number[]) => {
    const vsiZe = ids.every((id) => prisotni.includes(id));
    setPrisotni((p) => (vsiZe ? p.filter((x) => !ids.includes(x)) : Array.from(new Set([...p, ...ids]))));
    setStanje("");
  };

  const izbrisiDan = async () => {
    if (!dan) return;
    if (!dan.id) {
      setDan(null);
      return;
    }
    if (!confirm(`Izbrišem ${lepDatum(dan.datum, true)} z vso prisotnostjo?`)) return;
    await api({ akcija: "izbrisi-dan", id: dan.id });
    setDan(null);
    nalozi();
  };

  // ---------- Otroci ----------
  const dodajOtroka = async () => {
    if (!novoIme.trim()) return;
    try {
      await api({ akcija: "dodaj-otroka", ekipa, ime: novoIme.trim(), letnik: novLetnik, skupina: novaSkupina });
      setNovoIme("");
      nalozi();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const izberiNovoSkupino = (nastavi: (v: string) => void) => {
    const ime = prompt("Ime nove skupine (npr. U12 deklice)");
    if (ime && ime.trim()) nastavi(ime.trim());
  };

  const urediOtroka = async (o: Otrok, polja: Partial<Otrok>) => {
    setOtroci((p) => p.map((x) => (x.id === o.id ? { ...x, ...polja } : x)));
    try {
      await api({ akcija: "uredi-otroka", id: o.id, ...polja });
    } catch (e: any) {
      alert(e.message);
    }
    nalozi();
  };

  const preimenuj = (o: Otrok) => {
    const ime = prompt("Ime in priimek", o.ime);
    if (ime && ime.trim() && ime.trim() !== o.ime) urediOtroka(o, { ime: ime.trim() });
  };

  const izbrisiOtroka = async (o: Otrok) => {
    if (!confirm(`Izbrišem ${o.ime} in vso njegovo prisotnost? (Če samo ne trenira več, raje klikni »Ne trenira več«.)`)) return;
    await api({ akcija: "izbrisi-otroka", id: o.id });
    nalozi();
  };

  // =========================================================================
  // ODPRT DAN
  // =========================================================================
  if (dan) {
    // Otroci, ki niso več aktivni, a so bili ta dan prisotni, ostanejo vidni
    const prikazani = otroci.filter((o) => o.aktiven || prisotni.includes(o.id));
    return (
      <div className="max-w-2xl mx-auto pb-32">
        <div className="sticky top-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 bg-slate-50/95 backdrop-blur flex items-center justify-between mb-3">
          <button
            onClick={zapriDan}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-navy py-2"
          >
            <ArrowLeft size={18} /> Nazaj
          </button>
          <div className="text-xs font-semibold">
            {neshranjeno ? (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <AlertCircle size={14} /> Ni shranjeno
              </span>
            ) : stanje === "shranjeno" ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check size={14} /> Shranjeno
              </span>
            ) : null}
          </div>
        </div>

        {(() => {
          const st = stevilkaDne(treningi, dan.datum, dan.tip);
          const tt = TIPI.find((x) => x.v === dan.tip);
          return (
            <div className="mb-5">
              <div className="text-sm font-extrabold text-brand-orange">
                {st.poTipu}. {(tt?.l || dan.tip).toLowerCase()} · {st.naSnegu}. dan na snegu
              </div>
              <h1 className="text-2xl font-extrabold text-brand-navy">{lepDatum(dan.datum, true)}</h1>
              <p className="text-sm text-slate-500">
                Ekipa {dan.ekipa} · sezona {st.sezona}
              </p>
            </div>
          );
        })()}

        <div className="bg-white rounded-2xl border border-slate-200/70 p-5 space-y-5 mb-5">
          <Razdelek naslov="Kaj">
            {TIPI.map((t) => (
              <Cip key={t.v} aktiven={dan.tip === t.v} onClick={() => nastaviPolje("tip", t.v)}>
                {t.ikona} {t.l}
              </Cip>
            ))}
          </Razdelek>
          <Razdelek naslov="Vožnja">
            {VOZNJA.map((t) => (
              <Cip key={t.v} aktiven={seznam(dan.voznja).includes(t.v)} onClick={() => preklopiVSeznamu("voznja", t.v)}>
                {t.l}
              </Cip>
            ))}
          </Razdelek>
          <Razdelek naslov="Disciplina">
            {DISCIPLINE.map((t) => (
              <Cip
                key={t.v}
                aktiven={seznam(dan.discipline).includes(t.v)}
                onClick={() => preklopiVSeznamu("discipline", t.v)}
              >
                {t.l}
              </Cip>
            ))}
          </Razdelek>
          <Razdelek naslov="Pogoji">
            {POGOJI.map((t) => (
              <Cip
                key={t.v}
                aktiven={dan.pogoji === t.v}
                onClick={() => nastaviPolje("pogoji", dan.pogoji === t.v ? "" : t.v)}
              >
                {t.ikona} {t.l}
              </Cip>
            ))}
          </Razdelek>
          <Razdelek naslov="Trenerja">
            {TRENERJI.map((t) => (
              <Cip key={t} aktiven={seznam(dan.trenerji).includes(t)} onClick={() => preklopiVSeznamu("trenerji", t)}>
                {t}
              </Cip>
            ))}
          </Razdelek>
        </div>

        {/* Otroci */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Prisotni</div>
              <div className="text-2xl font-extrabold text-brand-navy">
                {prisotni.filter((id) => prikazani.some((o) => o.id === id)).length}
                <span className="text-base text-slate-400"> / {aktivni.length}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => vsiPrisotni(true)}
                className="text-xs font-bold text-brand-orange border border-orange-200 bg-orange-50 px-3 py-2 rounded-lg"
              >
                Vsi
              </button>
              <button
                onClick={() => vsiPrisotni(false)}
                className="text-xs font-bold text-slate-500 border border-slate-200 px-3 py-2 rounded-lg"
              >
                Nihče
              </button>
            </div>
          </div>

          {prikazani.length === 0 ? (
            <div className="text-sm text-slate-500 py-6 text-center">
              V ekipi še ni otrok. Dodaj jih pod zavihkom »Otroci«.
            </div>
          ) : (
            <div className="space-y-4">
              {poSkupinah(prikazani).map((g) => {
                const ids = g.otroci.map((o) => o.id);
                const tuPrisotni = ids.filter((id) => prisotni.includes(id)).length;
                return (
                  <div key={g.skupina}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-extrabold text-brand-navy uppercase tracking-wide">
                        {g.skupina}{" "}
                        <span className="text-slate-400 font-semibold normal-case">
                          {tuPrisotni}/{ids.length}
                        </span>
                      </div>
                      <button
                        onClick={() => vsiVSkupini(ids)}
                        className="text-[11px] font-bold text-brand-orange px-2 py-1"
                      >
                        {tuPrisotni === ids.length ? "Odznači" : "Vsi"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {g.otroci.map((o) => {
                        const je = prisotni.includes(o.id);
                        return (
                          <button
                            key={o.id}
                            onClick={() => preklopiOtroka(o.id)}
                            className={`flex items-center gap-2.5 px-3 py-4 min-h-[60px] rounded-xl border-2 text-left transition active:scale-[0.97] select-none ${
                              je
                                ? "bg-green-50 border-green-500 text-green-900"
                                : "bg-white border-slate-200 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                je ? "bg-green-500 text-white" : "border-2 border-slate-300"
                              }`}
                            >
                              {je && <Check size={16} strokeWidth={3} />}
                            </span>
                            <span className="text-[15px] font-semibold leading-tight">{o.ime}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {dan.id > 0 && (
          <button
            onClick={izbrisiDan}
            className="mt-8 mx-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600"
          >
            <Trash2 size={13} /> Izbriši ta dan
          </button>
        )}

        {/* SHRANI — vedno na dnu zaslona */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="max-w-2xl mx-auto">
            {stanje === "napaka" && (
              <p className="text-xs text-red-600 text-center mb-2 font-semibold">
                Ni shranjeno — preveri signal in pritisni znova.
              </p>
            )}
            <button
              onClick={shraniDan}
              disabled={stanje === "shranjujem" || !neshranjeno}
              className={`w-full py-4 rounded-2xl text-lg font-extrabold flex items-center justify-center gap-2 transition ${
                neshranjeno
                  ? "bg-brand-orange text-white shadow-lg active:scale-[0.98]"
                  : "bg-green-50 text-green-700 border-2 border-green-200"
              }`}
            >
              {stanje === "shranjujem" ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Shranjujem…
                </>
              ) : neshranjeno ? (
                <>Shrani ({prisotni.filter((id) => prikazani.some((o) => o.id === id)).length} prisotnih)</>
              ) : (
                <>
                  <Check size={20} /> Shranjeno
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // GLAVNI POGLED
  // =========================================================================
  const danesOdprt = treningi.find((t) => t.datum === danes());

  return (
    <div className="max-w-2xl mx-auto pb-16">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2">
        <Mountain className="text-brand-orange" /> Treningi ekipe
      </h1>
      <p className="text-sm text-slate-500 mb-5">Prisotnost na treningih in tekmah — poklikaš in na koncu pritisneš Shrani.</p>

      {/* Ekipe */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {EKIPE.map((e) => (
          <button
            key={e}
            onClick={() => setEkipa(e)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap border ${
              ekipa === e
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-slate-600 border-slate-200"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Zavihki */}
      <div className={`grid ${jeAdmin ? "grid-cols-4" : "grid-cols-3"} gap-1 bg-slate-100 p-1 rounded-xl mb-5`}>
        {[
          { k: "dnevi", l: "Dnevi", i: CalendarDays },
          { k: "otroci", l: `Otroci`, i: Users },
          { k: "statistika", l: "Statistika", i: BarChart3 },
          ...(jeAdmin ? [{ k: "nastavitve", l: "Nastavitve", i: Settings2 }] : []),
        ].map(({ k, l, i: Ikona }) => (
          <button
            key={k}
            onClick={() => setPogled(k as any)}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-2 rounded-lg text-[11px] sm:text-sm font-bold ${
              pogled === k ? "bg-white text-brand-navy shadow-sm" : "text-slate-500"
            }`}
          >
            <Ikona size={15} /> {l}
          </button>
        ))}
      </div>

      {nalagam ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-slate-400" />
        </div>
      ) : pogled === "dnevi" ? (
        <>
          <button
            onClick={() => odpri(danes())}
            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white rounded-2xl py-5 text-lg font-extrabold shadow-sm mb-3"
          >
            {danesOdprt
              ? "Odpri današnji dan"
              : `Začni ${stevilkaDne(treningi, danes(), TIPI[0]?.v || "trening").poTipu}. ${(TIPI[0]?.l || "trening").toLowerCase()}`}
            <div className="text-xs font-semibold opacity-90 mt-0.5">{lepDatum(danes(), true)}</div>
          </button>

          <div className="flex gap-2 mb-6">
            <input
              type="date"
              value={drugDatum}
              onChange={(e) => setDrugDatum(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            />
            <button
              onClick={() => drugDatum && odpri(drugDatum)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-brand-navy"
            >
              Odpri drug dan
            </button>
          </div>

          {treningi.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-10">Še ni vpisanih dni.</div>
          ) : (
            <div className="space-y-5">
              {Array.from(new Set(treningi.map((t) => sezonaZa(t.datum)))).map((sez) => {
                const vSezoni = treningi.filter((t) => sezonaZa(t.datum) === sez);
                return (
                  <div key={sez}>
                    <div className="flex items-end justify-between px-1 mb-2">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Sezona {sez}</div>
                        <div className="text-lg font-extrabold text-brand-navy leading-tight">
                          {vSezoni.length} {vSezoni.length === 1 ? "dan" : vSezoni.length === 2 ? "dneva" : vSezoni.length <= 4 ? "dnevi" : "dni"} na snegu
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 text-right">
                        {TIPI.map((o) => `${vSezoni.filter((t) => t.tip === o.v).length} ${o.l.toLowerCase()}`).join(" · ")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {vSezoni.map((t) => {
                        const pog = POGOJI.find((p) => p.v === t.pogoji);
                        const tt = TIPI.find((x) => x.v === t.tip);
                        const st = stevilkaDne(treningi, t.datum, t.tip);
                        const tekma = t.tip !== (TIPI[0]?.v || "trening");
                        return (
                          <button
                            key={t.id}
                            onClick={() => odpri(t.datum)}
                            className="w-full bg-white rounded-xl border border-slate-200/70 px-4 py-3 flex items-center gap-3 text-left hover:border-slate-300"
                          >
                            <div className="w-24 shrink-0">
                              <div className={`text-[15px] font-extrabold leading-tight ${tekma ? "text-brand-navy" : "text-brand-orange"}`}>
                                {st.poTipu}. {(tt?.l || t.tip).toLowerCase()}
                              </div>
                              <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{lepDatum(t.datum)}</div>
                              <div className="text-[10px] text-slate-400 leading-tight">{st.naSnegu}. dan na snegu</div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-wrap gap-1">
                              {tt?.ikona && <span className="text-[13px] leading-none self-center">{tt.ikona}</span>}
                              {[...seznam(t.voznja).map((v) => VOZNJA.find((x) => x.v === v)?.l || v),
                                ...seznam(t.discipline).map((v) => DISCIPLINE.find((x) => x.v === v)?.l || v)].map((x) => (
                                <span key={x} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {x}
                                </span>
                              ))}
                              {pog && <span className="text-[13px] leading-none self-center">{pog.ikona}</span>}
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-extrabold text-brand-navy">{t.st_prisotnih ?? 0}</div>
                              <div className="text-[10px] text-slate-400">prisotnih</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : pogled === "otroci" ? (
        <>
          {/* Dodaj otroka */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 mb-4 space-y-4">
            <div className="text-sm font-bold text-brand-navy">Dodaj otroka v ekipo {ekipa}</div>
            <input
              value={novoIme}
              onChange={(e) => setNovoIme(e.target.value)}
              placeholder="Ime in priimek"
              autoCapitalize="words"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base outline-none focus:border-brand-orange"
            />
            <Razdelek naslov="Letnik">
              {LETNIKI.map((l) => (
                <Cip key={l} aktiven={novLetnik === l} onClick={() => setNovLetnik(novLetnik === l ? null : l)}>
                  {l}
                </Cip>
              ))}
            </Razdelek>
            <Razdelek naslov="Skupina">
              {skupineEkipe.map((sk) => (
                <Cip key={sk} aktiven={novaSkupina === sk} onClick={() => setNovaSkupina(novaSkupina === sk ? "" : sk)}>
                  {sk}
                </Cip>
              ))}
              {novaSkupina && !skupineEkipe.includes(novaSkupina) && (
                <Cip aktiven onClick={() => setNovaSkupina("")}>{novaSkupina}</Cip>
              )}
              <button
                type="button"
                onClick={() => izberiNovoSkupino(setNovaSkupina)}
                className="px-4 py-3 rounded-xl text-sm font-bold border-2 border-dashed border-slate-300 text-slate-500"
              >
                + Nova
              </button>
            </Razdelek>
            <button
              onClick={dodajOtroka}
              disabled={!novoIme.trim()}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-brand-orange text-white py-3.5 rounded-xl text-base font-bold disabled:opacity-40"
            >
              <Plus size={18} /> Dodaj otroka
            </button>
          </div>

          {/* Seznam po skupinah */}
          {otroci.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-5 text-sm text-slate-400 text-center">Ni otrok.</div>
          )}
          <div className="space-y-4">
            {poSkupinah(otroci).map((g) => (
              <div key={g.skupina}>
                <div className="text-xs font-extrabold text-brand-navy uppercase tracking-wide mb-2 px-1">
                  {g.skupina} <span className="text-slate-400 font-semibold normal-case">{g.otroci.filter((o) => o.aktiven).length}</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100">
                  {g.otroci.map((o) => (
                    <div key={o.id} className={o.aktiven ? "" : "opacity-50"}>
                      <button
                        onClick={() => setUrejam(urejam === o.id ? null : o.id)}
                        className="w-full flex items-center gap-2 px-4 py-3.5 text-left"
                      >
                        <span className="flex-1 text-[15px] font-semibold text-slate-800">{o.ime}</span>
                        {o.letnik && <span className="text-xs font-semibold text-slate-400">{o.letnik}</span>}
                        {!o.aktiven && <span className="text-[10px] font-bold text-slate-400">ne trenira</span>}
                        <Pencil size={14} className="text-slate-300 ml-1" />
                      </button>
                      {urejam === o.id && (
                        <div className="px-4 pb-4 space-y-3 bg-slate-50/60">
                          <Razdelek naslov="Letnik">
                            {LETNIKI.map((l) => (
                              <Cip key={l} aktiven={o.letnik === l} onClick={() => urediOtroka(o, { letnik: l })}>
                                {l}
                              </Cip>
                            ))}
                          </Razdelek>
                          <Razdelek naslov="Skupina">
                            {skupineEkipe.map((sk) => (
                              <Cip key={sk} aktiven={o.skupina === sk} onClick={() => urediOtroka(o, { skupina: sk })}>
                                {sk}
                              </Cip>
                            ))}
                            <button
                              type="button"
                              onClick={() => izberiNovoSkupino((v) => urediOtroka(o, { skupina: v }))}
                              className="px-4 py-3 rounded-xl text-sm font-bold border-2 border-dashed border-slate-300 text-slate-500"
                            >
                              + Nova
                            </button>
                          </Razdelek>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => preimenuj(o)}
                              className="text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600"
                            >
                              Popravi ime
                            </button>
                            <button
                              onClick={() => urediOtroka(o, { aktiven: !o.aktiven })}
                              className="text-xs font-bold px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600"
                            >
                              {o.aktiven ? "Ne trenira več" : "Vrni v ekipo"}
                            </button>
                            <button
                              onClick={() => izbrisiOtroka(o)}
                              className="text-xs font-bold px-3 py-2.5 rounded-lg border border-red-100 bg-white text-red-600 ml-auto"
                            >
                              Izbriši
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : pogled === "statistika" ? (
        // STATISTIKA
        <>
          {!stat ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : (
            (() => {
              const sezone = Array.from(new Set([sezonaZa(danes()), ...stat.treningi.map((t) => sezonaZa(t.datum))])).sort().reverse();
              const dniSezone = stat.treningi.filter((t) => sezonaZa(t.datum) === statSezona);
              const poId = new Map(dniSezone.map((t) => [t.id, t]));
              const steviloDni = dniSezone.length;
              // stolpci: tipi, vožnja, discipline (iz trenutnih nastavitev)
              const stolpci: { kljuc: string; naslov: string; ujema: (t: StatPodatki["treningi"][number]) => boolean }[] = [
                ...TIPI.map((o) => ({ kljuc: "t-" + o.v, naslov: o.l, ujema: (t: any) => t.tip === o.v })),
                ...VOZNJA.map((o) => ({ kljuc: "v-" + o.v, naslov: o.l, ujema: (t: any) => seznam(t.voznja).includes(o.v) })),
                ...DISCIPLINE.map((o) => ({ kljuc: "d-" + o.v, naslov: o.l, ujema: (t: any) => seznam(t.discipline).includes(o.v) })),
              ];
              const vrstice = stat.otroci.map((o) => {
                const moji = stat.prisotnost
                  .filter((p) => p.otrok_id === o.id)
                  .map((p) => poId.get(p.trening_id))
                  .filter(Boolean) as StatPodatki["treningi"];
                return {
                  ...o,
                  skupaj: moji.length,
                  stevci: stolpci.map((c) => moji.filter(c.ujema).length),
                };
              });
              return (
                <>
                  {sezone.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                      {sezone.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setStatSezona(sz)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${
                            statSezona === sz ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-slate-600 border-slate-200"
                          }`}
                        >
                          Sezona {sz}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{ l: "Dni na snegu", v: steviloDni }, ...TIPI.slice(0, 2).map((o) => ({
                      l: o.l, v: dniSezone.filter((t) => t.tip === o.v).length,
                    }))].map((x) => (
                      <div key={x.l} className="bg-white rounded-xl border border-slate-200/70 p-3 text-center">
                        <div className="text-2xl font-extrabold text-brand-navy">{x.v}</div>
                        <div className="text-[11px] text-slate-500">{x.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200/70 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wide text-slate-400 text-right">
                          <th className="text-left px-3 py-2.5 sticky left-0 bg-white">Otrok</th>
                          <th className="px-2">%</th>
                          {stolpci.map((c) => (
                            <th key={c.kljuc} className="px-2 whitespace-nowrap">{c.naslov}</th>
                          ))}
                          <th className="px-3 whitespace-nowrap text-brand-navy">Skupaj</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {poSkupinah(vrstice).flatMap((g) => [
                          <tr key={"h-" + g.skupina} className="bg-slate-50">
                            <td colSpan={stolpci.length + 3} className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-brand-navy sticky left-0 bg-slate-50">
                              {g.skupina}
                            </td>
                          </tr>,
                          ...g.otroci.map((o) => {
                            const pct = steviloDni ? Math.round((o.skupaj / steviloDni) * 100) : 0;
                            return (
                              <tr key={o.id} className={`text-right ${o.aktiven ? "" : "opacity-50"}`}>
                                <td className="text-left px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap sticky left-0 bg-white">{o.ime}</td>
                                <td className={`px-2 font-bold ${pct >= 75 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                  {pct}%
                                </td>
                                {o.stevci.map((n, i) => (
                                  <td key={i} className={`px-2 ${i < TIPI.length ? "" : "text-slate-500"}`}>{n}</td>
                                ))}
                                <td className="px-3 font-extrabold text-brand-navy">{o.skupaj}</td>
                              </tr>
                            );
                          }),
                        ])}
                      </tbody>
                      <tfoot>
                        <tr className="text-right border-t-2 border-slate-200 bg-orange-50/60 font-extrabold text-brand-navy">
                          <td className="text-left px-3 py-3 sticky left-0 bg-orange-50 whitespace-nowrap">Dni ekipe</td>
                          <td className="px-2"></td>
                          {stolpci.map((c) => (
                            <td key={c.kljuc} className="px-2">{dniSezone.filter(c.ujema).length}</td>
                          ))}
                          <td className="px-3 text-brand-orange">{steviloDni}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Skupaj = koliko dni (treningov + tekem) je bil otrok na snegu. Zadnja vrstica = koliko dni je imela ekipa. % = delež dni, ko je bil otrok prisoten.
                  </p>
                </>
              );
            })()
          )}
        </>
      ) : (
        // NASTAVITVE (samo admin)
        <div className="space-y-4">
          <p className="text-xs text-slate-500 px-1">
            Tu urejaš gumbe, ki jih klikata trenerja. Preimenovanje ne pokvari starih vpisov. Izbrisana možnost ostane v starih dneh, le klikati je ne moreš več.
          </p>

          <UrejevalnikBesed
            naslov="Ekipe"
            vrednosti={osnutekM.ekipe}
            onChange={(v) => setOsnutekM({ ...osnutekM, ekipe: v })}
            opomba="Ime obstoječe ekipe raje ne spreminjaj — otroci in dnevi so vezani nanj."
          />
          <UrejevalnikBesed
            naslov="Trenerji"
            vrednosti={osnutekM.trenerji}
            onChange={(v) => setOsnutekM({ ...osnutekM, trenerji: v })}
          />
          <UrejevalnikMoznosti naslov="Kaj (trening / tekma …)" z_ikono vrednosti={osnutekM.tipi} onChange={(v) => setOsnutekM({ ...osnutekM, tipi: v })} />
          <UrejevalnikMoznosti naslov="Vožnja" vrednosti={osnutekM.voznja} onChange={(v) => setOsnutekM({ ...osnutekM, voznja: v })} />
          <UrejevalnikMoznosti naslov="Discipline" vrednosti={osnutekM.discipline} onChange={(v) => setOsnutekM({ ...osnutekM, discipline: v })} />
          <UrejevalnikMoznosti naslov="Pogoji" z_ikono vrednosti={osnutekM.pogoji} onChange={(v) => setOsnutekM({ ...osnutekM, pogoji: v })} />

          <div className="sticky bottom-3 z-10">
            <button
              onClick={shraniNastavitve}
              disabled={stanjeM === "shranjujem" || JSON.stringify(osnutekM) === JSON.stringify(M)}
              className="w-full bg-brand-orange text-white py-4 rounded-2xl text-base font-extrabold shadow-lg disabled:opacity-50"
            >
              {stanjeM === "shranjujem" ? "Shranjujem…" : JSON.stringify(osnutekM) === JSON.stringify(M) ? (stanjeM === "shranjeno" ? "Shranjeno ✓" : "Ni sprememb") : "Shrani nastavitve"}
            </button>
            {stanjeM === "napaka" && <p className="text-xs text-red-600 text-center mt-1">Ni shranjeno — poskusi znova.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
