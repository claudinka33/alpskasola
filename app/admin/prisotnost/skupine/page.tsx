"use client";

// Skupine in ekipe — Zoja razdeli otroke programa v skupine (npr. smučarske ekipe)
// in jim določi stalnega učitelja. Učitelji nato v Prisotnosti odprejo svojo skupino.
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Loader2, Pencil, Trash2, Users, CheckCircle2, Search, X } from "lucide-react";

type Skupina = {
  id: number; naziv: string; ucitelj: string | null; dan: string | null; ura: string | null;
  lokacija: string | null; aktiven: boolean; na_strani: boolean; st_otrok: number; st_vadb: number;
};
type Otrok = {
  id: number; otrok_ime: string; otrok_priimek: string; otrok_rojstvo: string | null;
  otrok_znanje: string | null; termin_id: number | null; status: string;
};

const ZNANJE: Record<string, { label: string; red: number }> = {
  zacetnik: { label: "Začetnik", red: 1 },
  osnovno: { label: "Osnovno", red: 2 },
  srednje: { label: "Srednje", red: 3 },
  napredno: { label: "Napredno", red: 4 },
  tekmovalno: { label: "Tekmovalno", red: 5 },
};
const starost = (d?: string | null) => {
  if (!d) return null;
  const r = new Date(d);
  if (isNaN(r.getTime())) return null;
  const n = new Date();
  let l = n.getFullYear() - r.getFullYear();
  if (n < new Date(n.getFullYear(), r.getMonth(), r.getDate())) l--;
  return l;
};
const DNEVI = ["", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota", "Nedelja"];
const I = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-orange";

function Stran() {
  const router = useRouter();
  const sp = useSearchParams();
  const [programi, setProgrami] = useState<{ slug: string; naziv: string }[]>([]);
  const [program, setProgram] = useState(sp.get("program") || "sola-smucanja");
  const [skupine, setSkupine] = useState<Skupina[]>([]);
  const [otroci, setOtroci] = useState<Otrok[]>([]);
  const [admin, setAdmin] = useState(false);
  const [ucitelji, setUcitelji] = useState<string[]>([]);
  const [nalagam, setNalagam] = useState(true);
  const [napaka, setNapaka] = useState("");
  const [filter, setFilter] = useState<"brez" | "vsi" | number>("brez");
  const [q, setQ] = useState("");
  const [razvrsti, setRazvrsti] = useState<"znanje" | "starost" | "priimek">("znanje");
  const [izbrani, setIzbrani] = useState<Set<number>>(new Set());
  const [cilj, setCilj] = useState<string>("");
  const [delam, setDelam] = useState(false);
  const [obrazec, setObrazec] = useState<Partial<Skupina> | null>(null);

  useEffect(() => {
    fetch("/api/programi").then((r) => r.json()).then((d) => setProgrami(d.programi || []));
    fetch("/api/ucitelji").then((r) => r.json()).then((d) => setUcitelji((d.ucitelji || []).filter((u: any) => u.aktiven !== false).map((u: any) => u.ime)));
  }, []);

  const nalozi = async (prog = program) => {
    setNalagam(true);
    try {
      const d = await fetch(`/api/skupine?program=${encodeURIComponent(prog)}`).then((r) => r.json());
      if (d.error) return setNapaka(d.error);
      setNapaka("");
      setSkupine(d.skupine || []);
      setOtroci(d.otroci || []);
      setAdmin(!!d.admin);
    } finally {
      setNalagam(false);
    }
  };
  useEffect(() => {
    nalozi(program);
    setIzbrani(new Set());
    setFilter("brez");
    router.replace(`/admin/prisotnost/skupine?program=${program}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  const imeSkupine = (id: number | null) => skupine.find((s) => s.id === id)?.naziv || "Brez skupine";
  const brez = otroci.filter((o) => !o.termin_id || !skupine.some((s) => s.id === o.termin_id)).length;

  const prikazani = useMemo(() => {
    const iskanje = q.trim().toLowerCase();
    return otroci
      .filter((o) =>
        filter === "vsi" ? true : filter === "brez" ? !o.termin_id || !skupine.some((s) => s.id === o.termin_id) : o.termin_id === filter
      )
      .filter((o) => !iskanje || `${o.otrok_ime} ${o.otrok_priimek}`.toLowerCase().includes(iskanje))
      .sort((a, b) => {
        if (razvrsti === "priimek") return `${a.otrok_priimek} ${a.otrok_ime}`.localeCompare(`${b.otrok_priimek} ${b.otrok_ime}`, "sl");
        if (razvrsti === "starost") return (starost(a.otrok_rojstvo) ?? 99) - (starost(b.otrok_rojstvo) ?? 99);
        const za = ZNANJE[a.otrok_znanje || ""]?.red ?? 9, zb = ZNANJE[b.otrok_znanje || ""]?.red ?? 9;
        return za - zb || (starost(a.otrok_rojstvo) ?? 99) - (starost(b.otrok_rojstvo) ?? 99);
      });
  }, [otroci, filter, q, razvrsti, skupine]);

  const premakni = async (ids: number[], termin: string) => {
    if (!ids.length) return;
    setDelam(true);
    try {
      const r = await fetch("/api/skupine", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ akcija: "premakni", ids, termin_id: termin ? parseInt(termin) : null }),
      });
      if (!r.ok) alert((await r.json().catch(() => ({}))).error || "Premik ni uspel.");
      // takoj posodobi prikaz
      setOtroci((os) => os.map((o) => (ids.includes(o.id) ? { ...o, termin_id: termin ? parseInt(termin) : null } : o)));
      setIzbrani(new Set());
      setCilj("");
      nalozi();
    } finally {
      setDelam(false);
    }
  };

  const shraniSkupino = async () => {
    if (!obrazec?.naziv?.trim()) return alert("Vpiši ime skupine.");
    setDelam(true);
    try {
      const r = await fetch("/api/skupine", {
        method: obrazec.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(obrazec.id ? { akcija: "uredi", ...obrazec } : { program_slug: program, ...obrazec }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return alert(d.error || "Shranjevanje ni uspelo.");
      setObrazec(null);
      nalozi();
    } finally {
      setDelam(false);
    }
  };

  const izbrisi = async (s: Skupina) => {
    if (!confirm(`Izbrišem skupino "${s.naziv}"? Otroci (${s.st_otrok}) gredo nazaj med "Brez skupine".`)) return;
    const r = await fetch(`/api/skupine?id=${s.id}`, { method: "DELETE" });
    if (!r.ok) return alert((await r.json().catch(() => ({}))).error || "Brisanje ni uspelo.");
    if (filter === s.id) setFilter("brez");
    nalozi();
  };

  const preklopi = (id: number) =>
    setIzbrani((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const Chip = ({ aktiven, onClick, children }: { aktiven: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${
        aktiven ? "border-brand-navy bg-brand-navy text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-navy"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-w-0 pb-32">
      <Link href="/admin/prisotnost" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-orange">
        <ArrowLeft size={15} /> Prisotnost
      </Link>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-brand-navy"><Users size={24} className="text-brand-orange" /> Skupine in ekipe</h1>
          <p className="mt-1 text-sm text-slate-600">Razdeli otroke v skupine in vsaki določi učitelja. Učitelj potem v Prisotnosti odpre svojo skupino.</p>
        </div>
        {admin && (
          <button onClick={() => setObrazec({ naziv: `Skupina ${skupine.length + 1}` })} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-bold text-white">
            <Plus size={16} /> Nova skupina
          </button>
        )}
      </div>

      {/* Programi */}
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {programi.map((p) => (
          <Chip key={p.slug} aktiven={program === p.slug} onClick={() => setProgram(p.slug)}>{p.naziv}</Chip>
        ))}
      </div>

      {napaka && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{napaka}</div>}

      {nalagam && !otroci.length ? (
        <div className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-brand-orange" size={28} /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Otroci */}
          <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white">
            <div className="space-y-2 border-b border-slate-100 p-3">
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
                <Chip aktiven={filter === "brez"} onClick={() => setFilter("brez")}>Brez skupine · {brez}</Chip>
                <Chip aktiven={filter === "vsi"} onClick={() => setFilter("vsi")}>Vsi · {otroci.length}</Chip>
                {skupine.map((s) => (
                  <Chip key={s.id} aktiven={filter === s.id} onClick={() => setFilter(s.id)}>{s.naziv} · {s.st_otrok}</Chip>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Išči otroka ..." className={`${I} pl-9`} />
                </div>
                <select value={razvrsti} onChange={(e) => setRazvrsti(e.target.value as any)} className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm">
                  <option value="znanje">Po znanju</option>
                  <option value="starost">Po starosti</option>
                  <option value="priimek">Po priimku</option>
                </select>
              </div>
              {admin && prikazani.length > 0 && (
                <button
                  onClick={() => setIzbrani(izbrani.size === prikazani.length ? new Set() : new Set(prikazani.map((o) => o.id)))}
                  className="text-xs font-bold text-brand-orange hover:underline"
                >
                  {izbrani.size === prikazani.length ? "Odznači vse" : `Označi vse (${prikazani.length})`}
                </button>
              )}
            </div>

            {prikazani.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">
                {filter === "brez" ? "Vsi otroci so že razporejeni v skupine. 🎉" : "Ni otrok."}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {prikazani.map((o) => {
                  const l = starost(o.otrok_rojstvo);
                  const zn = ZNANJE[o.otrok_znanje || ""]?.label;
                  const oznacen = izbrani.has(o.id);
                  return (
                    <li key={o.id} className={`flex items-center gap-3 px-3 py-2.5 ${oznacen ? "bg-orange-50" : ""}`}>
                      {admin && (
                        <input type="checkbox" checked={oznacen} onChange={() => preklopi(o.id)} className="h-5 w-5 shrink-0 accent-brand-orange" />
                      )}
                      <button onClick={() => admin && preklopi(o.id)} className="min-w-0 flex-1 text-left">
                        <div className="truncate font-semibold text-brand-navy">{o.otrok_ime} {o.otrok_priimek}</div>
                        <div className="flex flex-wrap gap-1 text-[11px] text-slate-500">
                          {l != null && <span>{l} let</span>}
                          {zn && <span className="rounded bg-sky-50 px-1.5 font-semibold text-sky-800">{zn}</span>}
                          {filter === "vsi" && <span className="truncate">· {imeSkupine(o.termin_id)}</span>}
                          {o.status === "nova" && <span className="rounded bg-orange-100 px-1.5 font-semibold text-orange-800">nova</span>}
                        </div>
                      </button>
                      {admin && (
                        <select
                          value={o.termin_id && skupine.some((s) => s.id === o.termin_id) ? String(o.termin_id) : ""}
                          onChange={(e) => premakni([o.id], e.target.value)}
                          disabled={delam}
                          className="h-9 w-[38%] max-w-[180px] shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-brand-navy"
                          aria-label="Skupina"
                        >
                          <option value="">— brez —</option>
                          {skupine.map((s) => <option key={s.id} value={s.id}>{s.naziv}</option>)}
                        </select>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Skupine */}
          <div className="min-w-0 space-y-3">
            {skupine.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                Ta program še nima skupin.{admin && " Klikni »Nova skupina«."}
              </div>
            )}
            {skupine.map((s) => (
              <div key={s.id} className={`rounded-2xl border bg-white p-4 ${filter === s.id ? "border-brand-orange" : "border-slate-200/70"}`}>
                <div className="flex items-start gap-2">
                  <button onClick={() => setFilter(s.id)} className="min-w-0 flex-1 text-left">
                    <div className="font-extrabold text-brand-navy">{s.naziv}</div>
                    <div className="text-xs text-slate-500">
                      {[s.ucitelj ? `👤 ${s.ucitelj}` : "Brez učitelja", [s.dan, s.ura].filter(Boolean).join(" ")].filter(Boolean).join(" · ")}
                    </div>
                  </button>
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800"><Users size={12} /> {s.st_otrok}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                  <Link href={`/admin/prisotnost?skupina=${s.id}`} className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-bold text-white">
                    <CheckCircle2 size={13} /> Prisotnost
                  </Link>
                  {admin && (
                    <>
                      <button onClick={() => setObrazec(s)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-brand-navy"><Pencil size={12} /> Uredi</button>
                      {s.st_vadb === 0 && !s.aktiven && !s.na_strani && (
                        <button onClick={() => izbrisi(s)} className="ml-auto p-1.5 text-slate-400 hover:text-red-600" title="Izbriši skupino"><Trash2 size={15} /></button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spodnja vrstica za premik izbranih */}
      {admin && izbrani.size > 0 && (
        <div className="fixed inset-x-0 bottom-[64px] lg:bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-2xl lg:left-[200px]">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-brand-navy">Izbranih: {izbrani.size}</span>
            <select value={cilj} onChange={(e) => setCilj(e.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm">
              <option value="">Izberi skupino …</option>
              {skupine.map((s) => <option key={s.id} value={s.id}>{s.naziv} ({s.st_otrok})</option>)}
              <option value="0">— Brez skupine —</option>
            </select>
            <button
              onClick={() => premakni(Array.from(izbrani), cilj === "0" ? "" : cilj)}
              disabled={!cilj || delam}
              className="h-10 rounded-lg bg-brand-orange px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              {delam ? <Loader2 size={16} className="animate-spin" /> : "Premakni"}
            </button>
            <button onClick={() => setIzbrani(new Set())} className="p-2 text-slate-400" aria-label="Prekliči"><X size={18} /></button>
          </div>
        </div>
      )}

      {/* Obrazec za skupino */}
      {obrazec && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setObrazec(null)}>
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-extrabold text-brand-navy">{obrazec.id ? "Uredi skupino" : "Nova skupina"}</h2>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600">Ime skupine
                <input autoFocus value={obrazec.naziv || ""} onChange={(e) => setObrazec({ ...obrazec, naziv: e.target.value })} placeholder="npr. Začetniki 1, Ekipa Medvedki" className={`${I} mt-1`} />
              </label>
              <label className="block text-xs font-semibold text-slate-600">Učitelj
                <input list="ucitelji-seznam" value={obrazec.ucitelj || ""} onChange={(e) => setObrazec({ ...obrazec, ucitelj: e.target.value })} placeholder="Ime učitelja" className={`${I} mt-1`} />
                <datalist id="ucitelji-seznam">{ucitelji.map((u) => <option key={u} value={u} />)}</datalist>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-slate-600">Dan
                  <select value={obrazec.dan || ""} onChange={(e) => setObrazec({ ...obrazec, dan: e.target.value })} className={`${I} mt-1`}>
                    {DNEVI.map((d) => <option key={d} value={d}>{d || "—"}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-600">Ura
                  <input value={obrazec.ura || ""} onChange={(e) => setObrazec({ ...obrazec, ura: e.target.value })} placeholder="9.00 - 15.00" className={`${I} mt-1`} />
                </label>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setObrazec(null)} className="h-11 flex-1 rounded-lg border border-slate-200 text-sm font-bold text-slate-600">Prekliči</button>
              <button onClick={shraniSkupino} disabled={delam} className="h-11 flex-1 rounded-lg bg-brand-orange text-sm font-bold text-white disabled:opacity-50">
                {delam ? <Loader2 size={16} className="mx-auto animate-spin" /> : "Shrani"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkupinePage() {
  return (
    <Suspense fallback={null}>
      <Stran />
    </Suspense>
  );
}
