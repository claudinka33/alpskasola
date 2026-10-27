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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Nastavitve
// ---------------------------------------------------------------------------
const EKIPE = ["U8/U6", "U10/U12", "U14", "FIS"];
const TRENERJI = ["Claudia", "Nejc"];

const TIPI = [
  { v: "trening", l: "Trening", ikona: "🎿" },
  { v: "tekma", l: "Tekma", ikona: "🏁" },
];
const VOZNJA = [
  { v: "fraj", l: "Fraj" },
  { v: "proga", l: "Proga" },
];
const DISCIPLINE = [
  { v: "VSL", l: "VSL" },
  { v: "SL", l: "SL" },
  { v: "SG", l: "Super G" },
  { v: "Freestyle", l: "Freestyle" },
];
const POGOJI = [
  { v: "odlicni", l: "Odlični", ikona: "☀️" },
  { v: "dobri", l: "Dobri", ikona: "⛅" },
  { v: "slabi", l: "Slabi", ikona: "🌧️" },
];

type Otrok = { id: number; ime: string; ekipa: string; aktiven: boolean };
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
type StatVrstica = {
  otrok_id: number;
  ime: string;
  aktiven: boolean;
  prisoten_skupaj: number;
  treningi: number;
  tekme: number;
  vsl: number;
  sl: number;
  sg: number;
  freestyle: number;
  fraj: number;
  proga: number;
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
export default function EkipaPage() {
  const [ekipa, setEkipa] = useState("U10/U12");
  const [pogled, setPogled] = useState<"dnevi" | "otroci" | "statistika">("dnevi");
  const [otroci, setOtroci] = useState<Otrok[]>([]);
  const [treningi, setTreningi] = useState<Trening[]>([]);
  const [nalagam, setNalagam] = useState(true);

  // Odprt dan
  const [dan, setDan] = useState<Trening | null>(null);
  const [prisotni, setPrisotni] = useState<number[]>([]);
  const [stanje, setStanje] = useState<"" | "shranjujem" | "shranjeno" | "napaka">("");
  const [drugDatum, setDrugDatum] = useState(danes());

  // Otroci
  const [novaImena, setNovaImena] = useState("");

  // Statistika
  const [stat, setStat] = useState<{ otroci: StatVrstica[]; dnevi: { skupaj: number; treningi: number; tekme: number } } | null>(null);

  useEffect(() => {
    try {
      const e = localStorage.getItem("ekipa-izbrana");
      if (e && EKIPE.includes(e)) setEkipa(e);
    } catch {}
  }, []);

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

  // Shrani z indikatorjem
  const shrani = async (fn: () => Promise<any>) => {
    setStanje("shranjujem");
    try {
      await fn();
      setStanje("shranjeno");
    } catch {
      setStanje("napaka");
    }
  };

  // ---------- Dan ----------
  const odpri = async (datum: string) => {
    setStanje("");
    const d = await api({ akcija: "odpri-dan", ekipa, datum });
    setDan(d.trening);
    setPrisotni(d.prisotni || []);
    window.scrollTo({ top: 0 });
  };

  const zapriDan = () => {
    setDan(null);
    nalozi();
  };

  const nastaviPolje = (polje: keyof Trening, vrednost: string) => {
    if (!dan) return;
    setDan({ ...dan, [polje]: vrednost });
    shrani(() => api({ akcija: "uredi-dan", id: dan.id, polja: { [polje]: vrednost } }));
  };

  const preklopiVSeznamu = (polje: "voznja" | "discipline" | "trenerji", v: string) => {
    if (!dan) return;
    const zdaj = seznam(dan[polje]);
    const novo = zdaj.includes(v) ? zdaj.filter((x) => x !== v) : [...zdaj, v];
    nastaviPolje(polje, novo.join(";"));
  };

  const preklopiOtroka = (id: number) => {
    if (!dan) return;
    const je = prisotni.includes(id);
    setPrisotni((p) => (je ? p.filter((x) => x !== id) : [...p, id]));
    shrani(() => api({ akcija: "prisotnost", trening_id: dan.id, otrok_id: id, prisoten: !je }));
  };

  const vsiPrisotni = (prisoten: boolean) => {
    if (!dan) return;
    const ids = aktivni.map((o) => o.id);
    setPrisotni(prisoten ? ids : []);
    shrani(() => api({ akcija: "vsi-prisotni", trening_id: dan.id, otrok_ids: ids, prisoten }));
  };

  const izbrisiDan = async () => {
    if (!dan) return;
    if (!confirm(`Izbrišem ${lepDatum(dan.datum, true)} z vso prisotnostjo?`)) return;
    await api({ akcija: "izbrisi-dan", id: dan.id });
    zapriDan();
  };

  // ---------- Otroci ----------
  const dodajOtroke = async () => {
    const imena = novaImena.split(/\n|,/).map((x) => x.trim()).filter(Boolean);
    if (imena.length === 0) return;
    await api({ akcija: "dodaj-otroke", ekipa, imena });
    setNovaImena("");
    nalozi();
  };

  const urediOtroka = async (o: Otrok, polja: Partial<Otrok>) => {
    await api({ akcija: "uredi-otroka", id: o.id, ...polja });
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
      <div className="max-w-2xl mx-auto pb-24">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={zapriDan}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-navy py-2"
          >
            <ArrowLeft size={18} /> Nazaj
          </button>
          <div className="text-xs font-semibold h-5">
            {stanje === "shranjujem" && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Loader2 size={13} className="animate-spin" /> Shranjujem…
              </span>
            )}
            {stanje === "shranjeno" && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check size={14} /> Shranjeno
              </span>
            )}
            {stanje === "napaka" && (
              <span className="inline-flex items-center gap-1 text-red-600">
                <AlertCircle size={14} /> Ni shranjeno — preveri signal in klikni znova
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-brand-navy">{lepDatum(dan.datum, true)}</h1>
        <p className="text-sm text-slate-500 mb-5">Ekipa {dan.ekipa}</p>

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
            <div className="grid grid-cols-2 gap-2">
              {prikazani.map((o) => {
                const je = prisotni.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => preklopiOtroka(o.id)}
                    className={`flex items-center gap-2.5 px-3 py-4 rounded-xl border-2 text-left transition active:scale-[0.97] ${
                      je
                        ? "bg-green-50 border-green-500 text-green-900"
                        : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        je ? "bg-green-500 text-white" : "border-2 border-slate-300"
                      }`}
                    >
                      {je && <Check size={15} strokeWidth={3} />}
                    </span>
                    <span className="text-sm font-semibold leading-tight">{o.ime}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={izbrisiDan}
          className="mt-8 mx-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-600"
        >
          <Trash2 size={13} /> Izbriši ta dan
        </button>
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
      <p className="text-sm text-slate-500 mb-5">Prisotnost na treningih in tekmah — samo klikaš, vse se shrani sproti.</p>

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
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-5">
        {[
          { k: "dnevi", l: "Dnevi", i: CalendarDays },
          { k: "otroci", l: `Otroci (${aktivni.length})`, i: Users },
          { k: "statistika", l: "Statistika", i: BarChart3 },
        ].map(({ k, l, i: Ikona }) => (
          <button
            key={k}
            onClick={() => setPogled(k as any)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold ${
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
            {danesOdprt ? "Odpri današnji dan" : "Začni današnji trening"}
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
            <div className="space-y-2">
              {treningi.map((t) => {
                const pog = POGOJI.find((p) => p.v === t.pogoji);
                return (
                  <button
                    key={t.id}
                    onClick={() => odpri(t.datum)}
                    className="w-full bg-white rounded-xl border border-slate-200/70 px-4 py-3 flex items-center gap-3 text-left hover:border-slate-300"
                  >
                    <div className="w-14 shrink-0">
                      <div className="text-sm font-extrabold text-brand-navy leading-tight">{lepDatum(t.datum)}</div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-wrap gap-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          t.tip === "tekma" ? "bg-brand-navy text-white" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {t.tip === "tekma" ? "🏁 Tekma" : "🎿 Trening"}
                      </span>
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
          )}
        </>
      ) : pogled === "otroci" ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/70 p-5 mb-4">
            <label className="block text-sm font-bold text-brand-navy mb-1">Dodaj otroke v ekipo {ekipa}</label>
            <p className="text-xs text-slate-500 mb-2">Vsako ime v svojo vrstico — lahko prilepiš cel seznam naenkrat. To narediš samo enkrat.</p>
            <textarea
              value={novaImena}
              onChange={(e) => setNovaImena(e.target.value)}
              rows={4}
              placeholder={"Ana Novak\nLuka Kovač"}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-orange mb-2"
            />
            <button
              onClick={dodajOtroke}
              disabled={!novaImena.trim()}
              className="inline-flex items-center gap-1.5 bg-brand-orange text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-40"
            >
              <Plus size={16} /> Dodaj
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 divide-y divide-slate-100">
            {otroci.length === 0 && <div className="p-5 text-sm text-slate-400 text-center">Ni otrok.</div>}
            {otroci.map((o) => (
              <div key={o.id} className={`flex items-center gap-2 px-4 py-3 ${o.aktiven ? "" : "opacity-50"}`}>
                <span className="flex-1 text-sm font-semibold text-slate-800">{o.ime}</span>
                <button onClick={() => preimenuj(o)} className="p-2 text-slate-400 hover:text-brand-navy" title="Preimenuj">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => urediOtroka(o, { aktiven: !o.aktiven })}
                  className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500"
                >
                  {o.aktiven ? "Ne trenira več" : "Vrni v ekipo"}
                </button>
                <button onClick={() => izbrisiOtroka(o)} className="p-2 text-slate-300 hover:text-red-600" title="Izbriši">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        // STATISTIKA
        <>
          {!stat ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { l: "Dni skupaj", v: stat.dnevi?.skupaj ?? 0 },
                  { l: "Treningov", v: stat.dnevi?.treningi ?? 0 },
                  { l: "Tekem", v: stat.dnevi?.tekme ?? 0 },
                ].map((x) => (
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
                      <th className="text-left px-3 py-2.5">Otrok</th>
                      <th className="px-2">%</th>
                      <th className="px-2">Tren.</th>
                      <th className="px-2">Tekme</th>
                      <th className="px-2">Fraj</th>
                      <th className="px-2">Proga</th>
                      <th className="px-2">VSL</th>
                      <th className="px-2">SL</th>
                      <th className="px-2">SG</th>
                      <th className="px-2 pr-3">Free</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stat.otroci.map((o) => {
                      const vsi = stat.dnevi?.skupaj || 0;
                      const pct = vsi ? Math.round((o.prisoten_skupaj / vsi) * 100) : 0;
                      return (
                        <tr key={o.otrok_id} className={`text-right ${o.aktiven ? "" : "opacity-50"}`}>
                          <td className="text-left px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{o.ime}</td>
                          <td className={`px-2 font-bold ${pct >= 75 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                            {pct}%
                          </td>
                          <td className="px-2">{o.treningi}</td>
                          <td className="px-2">{o.tekme}</td>
                          <td className="px-2 text-slate-500">{o.fraj}</td>
                          <td className="px-2 text-slate-500">{o.proga}</td>
                          <td className="px-2 text-slate-500">{o.vsl}</td>
                          <td className="px-2 text-slate-500">{o.sl}</td>
                          <td className="px-2 text-slate-500">{o.sg}</td>
                          <td className="px-2 pr-3 text-slate-500">{o.freestyle}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">% = koliko vpisanih dni ekipe je bil otrok prisoten.</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
