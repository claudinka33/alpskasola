"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertTriangle, Check, X } from "lucide-react";
import { IskalnikOtrok, ustrezaIskanju } from "@/components/admin/Starsi";

type Celica = { srecanj: number; minut: number };
type Izplacilo = {
  ime: string;
  mesec: string;
  izplacano: boolean;
  znesek: string | null;
  datum: string | null;
  opomba: string | null;
};

const MESECI = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];

const oznakaMeseca = (m: string) => {
  const [l, mm] = m.split("-");
  return `${MESECI[Number(mm) - 1]} ${l.slice(2)}`;
};

// Sezona teče od septembra do avgusta
const trenutnaSezona = () => {
  const d = new Date();
  return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
};

const meseciSezone = (leto: number) => {
  const out: string[] = [];
  for (let i = 0; i < 12; i++) {
    const m = ((8 + i) % 12) + 1;
    const l = i < 4 ? leto : leto + 1;
    out.push(`${l}-${String(m).padStart(2, "0")}`);
  }
  return out;
};

const taMesec = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const fmtUre = (minut: number) => {
  const h = minut / 60;
  return Number.isInteger(h) ? `${h}` : h.toFixed(1);
};

export default function Izplacila() {
  const [sezona, setSezona] = useState(trenutnaSezona());
  const [ure, setUre] = useState<Record<string, Record<string, Celica>>>({});
  const [izplacila, setIzplacila] = useState<Izplacilo[]>([]);
  const [nalagam, setNalagam] = useState(true);
  const [samoOdprti, setSamoOdprti] = useState(false);
  const [iskanje, setIskanje] = useState("");
  const [podrobno, setPodrobno] = useState<{ ime: string; mesec: string } | null>(null);
  const [shranjujem, setShranjujem] = useState<string | null>(null);

  const meseci = useMemo(() => meseciSezone(sezona), [sezona]);
  const danes = taMesec();

  const nalozi = async (tiho = false) => {
    if (!tiho) setNalagam(true);
    try {
      const d = await fetch(`/api/ure/izplacila?od=${meseci[0]}&do=${meseci[11]}`).then((r) => r.json());
      setUre(d.ure || {});
      setIzplacila(d.izplacila || []);
    } finally {
      setNalagam(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, [meseci]);

  const izp = useMemo(() => {
    const m: Record<string, Izplacilo> = {};
    for (const i of izplacila) m[`${i.ime}|${i.mesec}`] = i;
    return m;
  }, [izplacila]);

  // Učitelji z urami v sezoni ali z že vpisanim izplačilom
  const ucitelji = useMemo(() => {
    const imena = new Set<string>([...Object.keys(ure), ...izplacila.map((i) => i.ime)]);
    return [...imena]
      .map((ime) => {
        let odprtoMin = 0;
        let izplacanoMin = 0;
        let skupajMin = 0;
        for (const m of meseci) {
          const c = ure[ime]?.[m];
          if (!c?.minut) continue;
          skupajMin += c.minut;
          if (izp[`${ime}|${m}`]?.izplacano) izplacanoMin += c.minut;
          else if (m <= danes) odprtoMin += c.minut;
        }
        return { ime, odprtoMin, izplacanoMin, skupajMin };
      })
      .sort((a, b) => a.ime.localeCompare(b.ime, "sl"));
  }, [ure, izp, meseci, danes]);

  const prikazani = ucitelji
    .filter((u) => !samoOdprti || u.odprtoMin > 0)
    .filter((u) => ustrezaIskanju({ ime: u.ime }, iskanje));
  const skupajOdprto = ucitelji.reduce((s, u) => s + u.odprtoMin, 0);
  const skupajIzplacano = ucitelji.reduce((s, u) => s + u.izplacanoMin, 0);

  const preklopi = async (ime: string, mesec: string) => {
    const k = `${ime}|${mesec}`;
    const trenutno = izp[k];
    const novo = !trenutno?.izplacano;
    const datum = novo ? new Date().toISOString().slice(0, 10) : null;
    // Takoj pokaži spremembo, nato shrani
    setIzplacila((prej) => [
      ...prej.filter((i) => !(i.ime === ime && i.mesec === mesec)),
      { ime, mesec, izplacano: novo, datum, znesek: trenutno?.znesek ?? null, opomba: trenutno?.opomba ?? null },
    ]);
    setShranjujem(k);
    try {
      await fetch("/api/ure/izplacila", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime,
          mesec,
          izplacano: novo,
          datum,
          znesek: trenutno?.znesek ?? null,
          opomba: trenutno?.opomba ?? null,
        }),
      });
    } finally {
      setShranjujem(null);
      nalozi(true);
    }
  };

  const S = "px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange";

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Sezona</label>
          <select value={sezona} onChange={(e) => setSezona(parseInt(e.target.value))} className={`${S} w-full sm:w-auto`}>
            {[trenutnaSezona() - 1, trenutnaSezona(), trenutnaSezona() + 1].map((l) => (
              <option key={l} value={l}>
                {l}/{String(l + 1).slice(2)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:flex-1 sm:min-w-[220px]">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Iskanje</label>
          <IskalnikOtrok vrednost={iskanje} onChange={setIskanje} placeholder="Išči učitelja (ime, priimek)…" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer pb-2.5">
          <input
            type="checkbox"
            checked={samoOdprti}
            onChange={(e) => setSamoOdprti(e.target.checked)}
            className="w-4 h-4 accent-brand-orange"
          />
          <span className="text-sm text-slate-700">Samo neizplačani</span>
        </label>
      </div>

      {ucitelji.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <Kartica label="Učiteljev" vrednost={String(ucitelji.length)} />
          <Kartica label="Izplačano" vrednost={`${fmtUre(skupajIzplacano)} h`} barva="text-green-700" />
          <Kartica label="Še za izplačat" vrednost={`${fmtUre(skupajOdprto)} h`} barva="text-red-600" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {nalagam ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : prikazani.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            {iskanje
              ? `Ni učitelja, ki bi ustrezal iskanju »${iskanje}«.`
              : samoOdprti
              ? "Vsi učitelji so izplačani."
              : "V tej sezoni ni vpisanih vadb z učitelji."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <p className="text-[11px] text-slate-400 px-4 pt-3">
              V kvadratku so ure v tem mesecu. Klik = izplačano. Klik na zelen kvadratek = popravi ali odkljukaj.
              <span className="sm:hidden"> Tabelo povleci levo za ostale mesece.</span>
            </p>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-brand-navy sticky left-0 bg-slate-50">
                    Učitelj
                  </th>
                  {meseci.map((m) => (
                    <th
                      key={m}
                      className={`px-1.5 py-3 text-[10px] font-semibold uppercase text-center ${
                        m === danes ? "text-brand-orange" : "text-brand-navy"
                      }`}
                    >
                      {oznakaMeseca(m)}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-brand-navy text-right">Odprto</th>
                </tr>
              </thead>
              <tbody>
                {prikazani.map((u) => (
                  <tr key={u.ime} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-semibold text-brand-navy whitespace-nowrap sticky left-0 bg-white">
                      {u.ime}
                    </td>
                    {meseci.map((m) => {
                      const c = ure[u.ime]?.[m];
                      const p = izp[`${u.ime}|${m}`];
                      const imaUre = !!c?.minut;
                      const zamuda = imaUre && !p?.izplacano && m < danes;
                      return (
                        <td key={m} className="px-1.5 py-2.5 text-center">
                          <button
                            onClick={() =>
                              p?.izplacano ? setPodrobno({ ime: u.ime, mesec: m }) : preklopi(u.ime, m)
                            }
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setPodrobno({ ime: u.ime, mesec: m });
                            }}
                            disabled={shranjujem === `${u.ime}|${m}`}
                            title={
                              p?.izplacano
                                ? `Izplačano${p.datum ? " " + new Date(p.datum).toLocaleDateString("sl-SI") : ""}${
                                    p.znesek ? ` · ${Number(p.znesek).toFixed(0)}€` : ""
                                  } — klik = popravi`
                                : imaUre
                                ? `${c!.srecanj} vadb · ${fmtUre(c!.minut)} h — klik = izplačano`
                                : "Ni ur v tem mesecu"
                            }
                            className={`w-12 h-10 rounded-lg border-2 flex flex-col items-center justify-center mx-auto leading-none ${
                              p?.izplacano
                                ? "bg-green-500 border-green-500 text-white"
                                : zamuda
                                ? "bg-red-50 border-red-200 text-red-700 hover:border-brand-orange"
                                : imaUre
                                ? "bg-white border-slate-200 text-brand-navy hover:border-brand-orange"
                                : "bg-white border-slate-100 text-slate-300 hover:border-slate-300"
                            }`}
                          >
                            {p?.izplacano && <Check size={12} className="mb-0.5" />}
                            <span className="text-[11px] font-bold">{imaUre ? `${fmtUre(c!.minut)}h` : "—"}</span>
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      {u.odprtoMin > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                          <AlertTriangle size={11} /> {fmtUre(u.odprtoMin)} h
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

      {podrobno && (
        <PodrobnoModal
          ime={podrobno.ime}
          mesec={podrobno.mesec}
          celica={ure[podrobno.ime]?.[podrobno.mesec]}
          podatki={izp[`${podrobno.ime}|${podrobno.mesec}`]}
          onClose={() => setPodrobno(null)}
          onShranjeno={() => {
            setPodrobno(null);
            nalozi(true);
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

function PodrobnoModal({
  ime,
  mesec,
  celica,
  podatki,
  onClose,
  onShranjeno,
}: {
  ime: string;
  mesec: string;
  celica?: Celica;
  podatki?: Izplacilo;
  onClose: () => void;
  onShranjeno: () => void;
}) {
  const [f, setF] = useState({
    izplacano: podatki?.izplacano ?? false,
    znesek: podatki?.znesek ?? "",
    datum: podatki?.datum?.slice(0, 10) || "",
    opomba: podatki?.opomba || "",
  });
  const [shranjujem, setShranjujem] = useState(false);

  const shrani = async () => {
    setShranjujem(true);
    await fetch("/api/ure/izplacila", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ime,
        mesec,
        ...f,
        datum: f.izplacano ? f.datum || new Date().toISOString().slice(0, 10) : f.datum || null,
      }),
    });
    setShranjujem(false);
    onShranjeno();
  };

  const odkljukaj = async () => {
    setShranjujem(true);
    await fetch("/api/ure/izplacila", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ime, mesec, izplacano: false, znesek: f.znesek, datum: null, opomba: f.opomba }),
    });
    setShranjujem(false);
    onShranjeno();
  };

  const I = "w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-orange";
  const L = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-extrabold text-brand-navy">
            {ime} — {oznakaMeseca(mesec)}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {celica?.minut ? `${celica.srecanj} vadb · ${fmtUre(celica.minut)} h` : "Ni ur v tem mesecu"}
        </p>

        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={f.izplacano}
            onChange={(e) => setF({ ...f, izplacano: e.target.checked })}
            className="w-4 h-4 accent-brand-orange"
          />
          <span className="text-sm font-semibold text-brand-navy">Izplačano</span>
        </label>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={L}>Znesek (€)</label>
            <input type="number" value={f.znesek} onChange={(e) => setF({ ...f, znesek: e.target.value })} className={I} />
          </div>
          <div>
            <label className={L}>Datum</label>
            <input type="date" value={f.datum} onChange={(e) => setF({ ...f, datum: e.target.value })} className={I} />
          </div>
        </div>
        <div className="mb-4">
          <label className={L}>Opomba</label>
          <input value={f.opomba} onChange={(e) => setF({ ...f, opomba: e.target.value })} className={I} />
        </div>
        <button
          onClick={shrani}
          disabled={shranjujem}
          className="w-full bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
        >
          {shranjujem ? "Shranjujem..." : "Shrani"}
        </button>
        {podatki?.izplacano && (
          <button
            onClick={odkljukaj}
            disabled={shranjujem}
            className="w-full mt-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50"
          >
            Odkljukaj (ni izplačano)
          </button>
        )}
      </div>
    </div>
  );
}
