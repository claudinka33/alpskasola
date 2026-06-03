"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  X,
  AlertCircle,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";

type Termin = {
  id: number;
  program_slug: string;
  naziv: string;
  lokacija: string | null;
  datum_od: string | null;
  datum_do: string | null;
  cena: number | null;
  status: string;
  aktiven: boolean;
  sezona: string | null;
  vrstni_red: number;
  opomba: string | null;
};
type Program = { id: number; slug: string; naziv: string };

const statusi = [
  { value: "odprt", label: "Odprt", cls: "bg-green-100 text-green-800" },
  { value: "napovedan", label: "Napovedan", cls: "bg-blue-100 text-blue-800" },
  { value: "poln", label: "Poln / Razprodano", cls: "bg-amber-100 text-amber-800" },
  { value: "zaprt", label: "Zaprt", cls: "bg-slate-100 text-slate-600" },
];

function datum(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TerminiPage() {
  const [termini, setTermini] = useState<Termin[]>([]);
  const [programi, setProgrami] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [modal, setModal] = useState<Termin | "nov" | null>(null);

  const programNaziv = (slug: string) => programi.find((p) => p.slug === slug)?.naziv || slug;

  const nalozi = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        fetch("/api/termini").then((r) => r.json()),
        fetch("/api/programi").then((r) => r.json()),
      ]);
      setTermini(t.termini || []);
      setProgrami(p.programi || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const preklopi = async (t: Termin) => {
    await fetch("/api/termini", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, samoAktiven: true, aktiven: !t.aktiven }),
    });
    nalozi();
  };

  const podvoji = async (t: Termin) => {
    await fetch("/api/termini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, id: undefined, naziv: `${t.naziv} (kopija)`, aktiven: false }),
    });
    nalozi();
  };

  const izbrisi = async (t: Termin) => {
    if (!confirm(`Izbrišem termin "${t.naziv}"?`)) return;
    await fetch(`/api/termini?id=${t.id}`, { method: "DELETE" });
    nalozi();
  };

  const prikazani = filter ? termini.filter((t) => t.program_slug === filter) : termini;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
            <CalendarDays size={26} className="text-brand-orange" /> Termini
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Razpiši in uredi termine. Samo <strong>aktivni</strong> termini se prikažejo na prijavnici.
          </p>
        </div>
        <button
          onClick={() => setModal("nov")}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-orange-dark transition-colors"
        >
          <Plus size={16} /> Nov termin
        </button>
      </div>

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none focus:border-brand-orange"
        >
          <option value="">Vsi programi</option>
          {programi.map((p) => (
            <option key={p.slug} value={p.slug}>{p.naziv}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : prikazani.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Ni terminov. Dodaj prvega z gumbom “Nov termin”.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  {["Program", "Termin", "Datum", "Cena", "Status", "Vidnost", "Akcije"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-semibold text-brand-navy text-xs uppercase ${i >= 5 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prikazani.map((t) => {
                  const st = statusi.find((s) => s.value === t.status);
                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600">{programNaziv(t.program_slug)}</td>
                      <td className="px-4 py-3 font-semibold text-brand-navy">
                        {t.naziv}
                        {t.lokacija && <span className="block text-xs font-normal text-slate-400">{t.lokacija}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {t.datum_od ? datum(t.datum_od) : "—"}
                        {t.datum_do ? ` – ${datum(t.datum_do)}` : ""}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{t.cena ? `${t.cena}€` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${st?.cls || "bg-slate-100 text-slate-600"}`}>
                          {st?.label || t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${t.aktiven ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>
                          {t.aktiven ? "VIDEN" : "SKRIT"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => preklopi(t)} title={t.aktiven ? "Skrij" : "Pokaži"} className="p-2 text-slate-500 hover:text-brand-orange">
                            {t.aktiven ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => podvoji(t)} title="Podvoji" className="p-2 text-slate-500 hover:text-brand-orange">
                            <Copy size={15} />
                          </button>
                          <button onClick={() => setModal(t)} title="Uredi" className="p-2 text-slate-500 hover:text-brand-orange">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => izbrisi(t)} title="Izbriši" className="p-2 text-slate-500 hover:text-red-600">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <TerminModal
          termin={modal === "nov" ? null : modal}
          programi={programi}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            nalozi();
          }}
        />
      )}
    </div>
  );
}

function TerminModal({
  termin,
  programi,
  onClose,
  onSaved,
}: {
  termin: Termin | null;
  programi: Program[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    program_slug: termin?.program_slug || programi[0]?.slug || "",
    naziv: termin?.naziv || "",
    lokacija: termin?.lokacija || "",
    datum_od: termin?.datum_od ? termin.datum_od.slice(0, 10) : "",
    datum_do: termin?.datum_do ? termin.datum_do.slice(0, 10) : "",
    cena: termin?.cena?.toString() || "",
    sezona: termin?.sezona || "",
    status: termin?.status || "odprt",
    aktiven: termin?.aktiven ?? true,
    vrstni_red: termin?.vrstni_red?.toString() || "0",
    opomba: termin?.opomba || "",
  });
  const [posiljam, setPosiljam] = useState(false);
  const [napaka, setNapaka] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");
    try {
      const res = await fetch("/api/termini", {
        method: termin ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: termin?.id }),
      });
      const data = await res.json();
      if (!res.ok) setNapaka(data.error || "Napaka");
      else onSaved();
    } catch {
      setNapaka("Napaka pri povezavi");
    } finally {
      setPosiljam(false);
    }
  };

  const L = "block text-xs font-semibold text-slate-600 mb-1";
  const I = "w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-brand-navy">{termin ? "Uredi termin" : "Nov termin"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={L}>Program *</label>
            <select required value={form.program_slug} onChange={(e) => setForm({ ...form, program_slug: e.target.value })} className={`${I} bg-white`}>
              {programi.map((p) => <option key={p.slug} value={p.slug}>{p.naziv}</option>)}
            </select>
          </div>

          <div>
            <label className={L}>Naziv termina *</label>
            <input required value={form.naziv} onChange={(e) => setForm({ ...form, naziv: e.target.value })} className={I} placeholder="Junij – Terme Zreče (popoldan)" />
          </div>

          <div>
            <label className={L}>Lokacija</label>
            <input value={form.lokacija} onChange={(e) => setForm({ ...form, lokacija: e.target.value })} className={I} placeholder="Terme Zreče" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={L}>Datum od</label>
              <input type="date" value={form.datum_od} onChange={(e) => setForm({ ...form, datum_od: e.target.value })} className={I} />
            </div>
            <div>
              <label className={L}>Datum do</label>
              <input type="date" value={form.datum_do} onChange={(e) => setForm({ ...form, datum_do: e.target.value })} className={I} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={L}>Cena (€)</label>
              <input type="number" value={form.cena} onChange={(e) => setForm({ ...form, cena: e.target.value })} className={I} placeholder="130" />
            </div>
            <div>
              <label className={L}>Sezona</label>
              <input value={form.sezona} onChange={(e) => setForm({ ...form, sezona: e.target.value })} className={I} placeholder="poletje-2026" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={L}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={`${I} bg-white`}>
                {statusi.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={L}>Vrstni red</label>
              <input type="number" value={form.vrstni_red} onChange={(e) => setForm({ ...form, vrstni_red: e.target.value })} className={I} />
            </div>
          </div>

          <div>
            <label className={L}>Opomba (interno)</label>
            <textarea value={form.opomba} onChange={(e) => setForm({ ...form, opomba: e.target.value })} rows={2} className={`${I} resize-y`} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.aktiven} onChange={(e) => setForm({ ...form, aktiven: e.target.checked })} className="w-4 h-4 accent-brand-orange" />
            <span className="text-sm text-slate-700">Aktiven (viden na prijavnici)</span>
          </label>

          {napaka && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{napaka}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200">Prekliči</button>
            <button type="submit" disabled={posiljam} className="flex-1 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
              {posiljam ? <><Loader2 size={16} className="animate-spin" /> Shranjujem...</> : "Shrani"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
