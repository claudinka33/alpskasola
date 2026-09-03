"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Euro, Settings2, AlertTriangle, Mail, X, Check } from "lucide-react";

type Program = { id: number; slug: string; naziv: string };
type Termin = { id: number; program_slug: string; naziv: string; lokacija: string | null; cena: number | null };
type Vrstica = {
  prijava_id: number;
  otrok_ime: string;
  otrok_priimek: string;
  termin_id: number | null;
  mesec: string | null;
  placano: boolean | null;
  znesek: string | null;
  datum: string | null;
  opomba: string | null;
  email?: string;
};
type Nastavitve = {
  mesec_od: string;
  mesec_do: string;
  privzeti_znesek: string | null;
  nacin?: string;
} | null;

const MESECI = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];

// Vrne seznam mesecev med 'od' in 'do' v obliki '2026-10'
function razponMesecev(od: string, do_: string) {
  const out: string[] = [];
  const [l1, m1] = od.split("-").map(Number);
  const [l2, m2] = do_.split("-").map(Number);
  if (!l1 || !m1 || !l2 || !m2) return out;
  let l = l1, m = m1;
  for (let i = 0; i < 36; i++) {
    out.push(`${l}-${String(m).padStart(2, "0")}`);
    if (l === l2 && m === m2) break;
    m++;
    if (m > 12) { m = 1; l++; }
  }
  return out;
}

const oznakaMeseca = (m: string) => {
  const [l, mm] = m.split("-");
  return `${MESECI[Number(mm) - 1]} ${l.slice(2)}`;
};

export default function PlacilaPage() {
  const [programi, setProgrami] = useState<Program[]>([]);
  const [termini, setTermini] = useState<Termin[]>([]);
  const [program, setProgram] = useState("");
  const [terminId, setTerminId] = useState<number | null>(null);

  const [vrstice, setVrstice] = useState<Vrstica[]>([]);
  const [nastavitve, setNastavitve] = useState<Nastavitve>(null);
  const [nalagam, setNalagam] = useState(false);
  const [urejamNastavitve, setUrejamNastavitve] = useState(false);
  const [celica, setCelica] = useState<{ prijava_id: number; mesec: string } | null>(null);
  const [samoDolzniki, setSamoDolzniki] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/programi").then((r) => r.json()),
      fetch("/api/termini").then((r) => r.json()),
    ]).then(([p, t]) => {
      setProgrami(p.programi || []);
      setTermini(t.termini || []);
    });
  }, []);

  const nalozi = async () => {
    if (!program) return;
    setNalagam(true);
    try {
      const q = terminId ? `&termin=${terminId}` : "";
      const d = await fetch(`/api/placila?program=${program}${q}`).then((r) => r.json());
      setVrstice(d.vrstice || []);
      setNastavitve(d.nastavitve || null);
    } finally {
      setNalagam(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, [program, terminId]);

  const mesecOd = nastavitve?.mesec_od || "2026-10";
  const mesecDo = nastavitve?.mesec_do || "2027-05";
  const enkratno = nastavitve?.nacin === "enkratno";
  const meseci = useMemo(
    () => (enkratno ? ["enkratno"] : razponMesecev(mesecOd, mesecDo)),
    [mesecOd, mesecDo, enkratno]
  );

  // Privzeti znesek: nastavitev programa, sicer cena termina
  const privzetiZnesek = (termin_id: number | null) => {
    if (nastavitve?.privzeti_znesek) return Number(nastavitve.privzeti_znesek);
    const t = termini.find((x) => x.id === termin_id);
    return t?.cena ?? null;
  };

  // Otroci z zloženimi plačili po mesecih
  const otroci = useMemo(() => {
    const m: Record<number, { ime: string; termin_id: number | null; placila: Record<string, Vrstica> }> = {};
    for (const v of vrstice) {
      if (!m[v.prijava_id]) {
        m[v.prijava_id] = {
          ime: `${v.otrok_ime} ${v.otrok_priimek}`,
          termin_id: v.termin_id,
          placila: {},
        };
      }
      if (v.mesec) m[v.prijava_id].placila[v.mesec] = v;
    }
    return Object.entries(m).map(([id, o]) => {
      const znesekMeseca = privzetiZnesek(o.termin_id) ?? 0;
      let placano = 0;
      let dolg = 0;
      for (const mm of meseci) {
        const p = o.placila[mm];
        const z = p?.znesek != null ? Number(p.znesek) : znesekMeseca;
        if (p?.placano) placano += z;
        else dolg += z;
      }
      return { prijava_id: Number(id), ...o, placano, dolg };
    });
  }, [vrstice, meseci, nastavitve, termini]);

  const prikazani = samoDolzniki ? otroci.filter((o) => o.dolg > 0) : otroci;
  const skupajDolg = otroci.reduce((s, o) => s + o.dolg, 0);
  const skupajPlacano = otroci.reduce((s, o) => s + o.placano, 0);

  const preklopi = async (prijava_id: number, mesec: string, trenutno: Vrstica | undefined, termin_id: number | null) => {
    const novo = !trenutno?.placano;
    await fetch("/api/placila", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prijava_id,
        mesec,
        placano: novo,
        znesek: trenutno?.znesek ?? privzetiZnesek(termin_id),
        datum: novo ? new Date().toISOString().slice(0, 10) : null,
        opomba: trenutno?.opomba ?? null,
      }),
    });
    nalozi();
  };

  const S = "px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
            <Euro size={26} className="text-brand-orange" /> Plačila
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {enkratno
              ? "Enkratno plačilo za tečaj. Obkljukaj otroka, ko je plačilo prispelo."
              : "Mesečna evidenca plačil po otrocih. Obkljukaj mesec, ko je plačilo prispelo."}
          </p>
        </div>
        {program && (
          <button
            onClick={() => setUrejamNastavitve(true)}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold hover:border-brand-orange"
          >
            <Settings2 size={16} /> Način in znesek
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Program</label>
          <select value={program} onChange={(e) => { setProgram(e.target.value); setTerminId(null); }} className={S}>
            <option value="">Izberi program</option>
            {programi.map((p) => (
              <option key={p.slug} value={p.slug}>{p.naziv}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Skupina (neobvezno)</label>
          <select
            value={terminId ?? ""}
            onChange={(e) => setTerminId(e.target.value ? parseInt(e.target.value) : null)}
            className={`${S} max-w-[300px]`}
          >
            <option value="">Vse skupine</option>
            {termini.filter((t) => t.program_slug === program).map((t) => (
              <option key={t.id} value={t.id}>{t.naziv}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer pb-2.5">
          <input
            type="checkbox"
            checked={samoDolzniki}
            onChange={(e) => setSamoDolzniki(e.target.checked)}
            className="w-4 h-4 accent-brand-orange"
          />
          <span className="text-sm text-slate-700">Samo dolžniki</span>
        </label>
      </div>

      {program && otroci.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <Kartica label="Otrok" vrednost={String(otroci.length)} />
          <Kartica label="Plačano skupaj" vrednost={`${skupajPlacano.toFixed(0)}€`} barva="text-green-700" />
          <Kartica label="Neplačano skupaj" vrednost={`${skupajDolg.toFixed(0)}€`} barva="text-red-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {!program ? (
          <p className="py-16 text-center text-sm text-slate-400">Izberi program.</p>
        ) : nalagam ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : prikazani.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">Ni otrok za prikaz.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy sticky left-0 bg-slate-50">
                    Otrok
                  </th>
                  {enkratno && (
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy">
                      Skupina
                    </th>
                  )}
                  {meseci.map((m) => (
                    <th key={m} className="px-2 py-3 text-[10px] font-semibold uppercase text-brand-navy text-center">
                      {enkratno ? "Plačano" : oznakaMeseca(m)}
                    </th>
                  ))}
                  {enkratno && (
                    <th className="px-4 py-3 text-xs font-semibold uppercase text-brand-navy text-right">
                      Znesek
                    </th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-brand-navy text-right">Dolg</th>
                </tr>
              </thead>
              <tbody>
                {prikazani.map((o) => (
                  <tr key={o.prijava_id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-semibold text-brand-navy whitespace-nowrap sticky left-0 bg-white">
                      {o.ime}
                    </td>
                    {enkratno && (
                      <td className="px-4 py-2.5 text-slate-600 text-xs">
                        {termini.find((t) => t.id === o.termin_id)?.naziv || "—"}
                      </td>
                    )}
                    {meseci.map((m) => {
                      const p = o.placila[m];
                      return (
                        <td key={m} className="px-2 py-2.5 text-center">
                          <button
                            onClick={() => preklopi(o.prijava_id, m, p, o.termin_id)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setCelica({ prijava_id: o.prijava_id, mesec: m });
                            }}
                            title={p?.datum ? `Plačano ${new Date(p.datum).toLocaleDateString("sl-SI")}` : "Klik = plačano, desni klik = podrobnosti"}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto ${
                              p?.placano
                                ? "bg-green-500 border-green-500 text-white"
                                : "bg-white border-slate-200 hover:border-brand-orange"
                            }`}
                          >
                            {p?.placano ? <Check size={15} /> : null}
                          </button>
                        </td>
                      );
                    })}
                    {enkratno && (
                      <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                        {(o.placila["enkratno"]?.znesek != null
                          ? Number(o.placila["enkratno"].znesek)
                          : privzetiZnesek(o.termin_id) ?? 0
                        ).toFixed(0)}
                        €
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {o.dolg > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                          <AlertTriangle size={11} /> {o.dolg.toFixed(0)}€
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                          Poravnano
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {samoDolzniki && prikazani.length > 0 && (
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <Mail size={12} /> Tem staršem pošlji opomnik prek Emailinga.
        </p>
      )}

      {urejamNastavitve && (
        <NastavitveModal
          program_slug={program}
          zacetne={{
            mesec_od: mesecOd,
            mesec_do: mesecDo,
            privzeti_znesek: nastavitve?.privzeti_znesek || "",
            nacin: nastavitve?.nacin || "mesecno",
          }}
          onClose={() => setUrejamNastavitve(false)}
          onShranjeno={() => {
            setUrejamNastavitve(false);
            nalozi();
          }}
        />
      )}

      {celica && (
        <CelicaModal
          podatki={otroci.find((o) => o.prijava_id === celica.prijava_id)?.placila[celica.mesec]}
          prijava_id={celica.prijava_id}
          mesec={celica.mesec}
          privzeti={privzetiZnesek(otroci.find((o) => o.prijava_id === celica.prijava_id)?.termin_id ?? null)}
          onClose={() => setCelica(null)}
          onShranjeno={() => {
            setCelica(null);
            nalozi();
          }}
        />
      )}
    </div>
  );
}

function Kartica({ label, vrednost, barva = "text-brand-navy" }: { label: string; vrednost: string; barva?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 p-4">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className={`text-2xl font-extrabold ${barva}`}>{vrednost}</div>
    </div>
  );
}

function NastavitveModal({
  program_slug,
  zacetne,
  onClose,
  onShranjeno,
}: {
  program_slug: string;
  zacetne: { mesec_od: string; mesec_do: string; privzeti_znesek: string; nacin: string };
  onClose: () => void;
  onShranjeno: () => void;
}) {
  const [f, setF] = useState(zacetne);
  const [shranjujem, setShranjujem] = useState(false);

  const shrani = async () => {
    setShranjujem(true);
    await fetch("/api/placila", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program_slug, ...f }),
    });
    setShranjujem(false);
    onShranjeno();
  };

  const I = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-orange";
  const L = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-extrabold text-brand-navy">Način plačevanja</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            ["mesecno", "Mesečno", "npr. Športna abeceda"],
            ["enkratno", "Enkratno", "npr. plavalni tečaj"],
          ].map(([v, l, o]) => (
            <button
              key={v}
              onClick={() => setF({ ...f, nacin: v })}
              className={`text-left rounded-xl border-2 px-4 py-3 ${
                f.nacin === v
                  ? "border-brand-orange bg-orange-50/60"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-sm font-bold text-brand-navy">{l}</div>
              <div className="text-[11px] text-slate-500">{o}</div>
            </button>
          ))}
        </div>

        <div className={`grid grid-cols-2 gap-3 mb-3 ${f.nacin === "enkratno" ? "hidden" : ""}`}>
          <div>
            <label className={L}>Od meseca</label>
            <input type="month" value={f.mesec_od} onChange={(e) => setF({ ...f, mesec_od: e.target.value })} className={I} />
          </div>
          <div>
            <label className={L}>Do meseca</label>
            <input type="month" value={f.mesec_do} onChange={(e) => setF({ ...f, mesec_do: e.target.value })} className={I} />
          </div>
        </div>
        <div className="mb-4">
          <label className={L}>{f.nacin === "enkratno" ? "Cena tečaja (€)" : "Mesečni znesek (€)"}</label>
          <input
            type="number"
            value={f.privzeti_znesek}
            onChange={(e) => setF({ ...f, privzeti_znesek: e.target.value })}
            className={I}
            placeholder={f.nacin === "enkratno" ? "130" : "35"}
          />
          <p className="text-xs text-slate-500 mt-1">
            Če pustiš prazno, se vzame cena, ki je vpisana pri terminu.
          </p>
        </div>
        <button
          onClick={shrani}
          disabled={shranjujem}
          className="w-full bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {shranjujem ? "Shranjujem..." : "Shrani"}
        </button>
      </div>
    </div>
  );
}

function CelicaModal({
  podatki,
  prijava_id,
  mesec,
  privzeti,
  onClose,
  onShranjeno,
}: {
  podatki?: Vrstica;
  prijava_id: number;
  mesec: string;
  privzeti: number | null;
  onClose: () => void;
  onShranjeno: () => void;
}) {
  const [f, setF] = useState({
    placano: podatki?.placano ?? false,
    znesek: podatki?.znesek ?? (privzeti != null ? String(privzeti) : ""),
    datum: podatki?.datum?.slice(0, 10) || "",
    opomba: podatki?.opomba || "",
  });

  const shrani = async () => {
    await fetch("/api/placila", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prijava_id, mesec, ...f }),
    });
    onShranjeno();
  };

  const I = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-orange";
  const L = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-extrabold text-brand-navy">
            Plačilo{mesec === "enkratno" ? " za tečaj" : ` — ${oznakaMeseca(mesec)}`}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={f.placano}
            onChange={(e) => setF({ ...f, placano: e.target.checked })}
            className="w-5 h-5 accent-green-600"
          />
          <span className="text-sm font-semibold text-slate-700">Plačano</span>
        </label>
        <div className="mb-3">
          <label className={L}>Znesek (€)</label>
          <input type="number" value={f.znesek} onChange={(e) => setF({ ...f, znesek: e.target.value })} className={I} />
        </div>
        <div className="mb-3">
          <label className={L}>Datum plačila</label>
          <input type="date" value={f.datum} onChange={(e) => setF({ ...f, datum: e.target.value })} className={I} />
        </div>
        <div className="mb-4">
          <label className={L}>Opomba</label>
          <input value={f.opomba} onChange={(e) => setF({ ...f, opomba: e.target.value })} className={I} placeholder="npr. gotovina" />
        </div>
        <button onClick={shrani} className="w-full bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold">
          Shrani
        </button>
      </div>
    </div>
  );
}
