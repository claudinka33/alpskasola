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
  Tag,
  Star,
} from "lucide-react";

type Postavka = {
  id: number;
  program_slug: string;
  naziv: string;
  podnaslov: string | null;
  cena: string;
  enota: string | null;
  opomba: string | null;
  vkljuceno: string | null;
  poudarjen: boolean;
  aktiven: boolean;
  vrstni_red: number;
};
type Program = { id: number; slug: string; naziv: string };

export default function CenikPage() {
  const [postavke, setPostavke] = useState<Postavka[]>([]);
  const [programi, setProgrami] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [modal, setModal] = useState<Postavka | "nov" | null>(null);

  const programNaziv = (slug: string) =>
    programi.find((p) => p.slug === slug)?.naziv || slug;

  const nalozi = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        fetch("/api/cenik").then((r) => r.json()),
        fetch("/api/programi").then((r) => r.json()),
      ]);
      setPostavke(c.cenik || []);
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

  const preklopi = async (t: Postavka) => {
    await fetch("/api/cenik", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, samoAktiven: true, aktiven: !t.aktiven }),
    });
    nalozi();
  };

  const podvoji = async (t: Postavka) => {
    await fetch("/api/cenik", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, id: undefined, naziv: `${t.naziv} (kopija)`, aktiven: false }),
    });
    nalozi();
  };

  const izbrisi = async (t: Postavka) => {
    if (!confirm(`Izbrišem postavko "${t.naziv}"?`)) return;
    await fetch(`/api/cenik?id=${t.id}`, { method: "DELETE" });
    nalozi();
  };

  const prikazane = filter ? postavke.filter((t) => t.program_slug === filter) : postavke;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
            <Tag size={26} className="text-brand-orange" /> Cenik
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cene in kartice, ki se prikažejo v sekciji <strong>Cenik</strong> na strani programa.
          </p>
        </div>
        <button
          onClick={() => setModal("nov")}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-orange-dark transition-colors"
        >
          <Plus size={16} /> Nova postavka
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
        ) : prikazane.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Ni postavk. Dodaj prvo z gumbom “Nova postavka”.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  {["Program", "Naziv", "Cena", "Vključeno", "Vidnost", "Akcije"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 font-semibold text-brand-navy text-xs uppercase ${i >= 4 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prikazane.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{programNaziv(t.program_slug)}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      <span className="inline-flex items-center gap-1.5">
                        {t.poudarjen && <Star size={13} className="text-brand-orange" />}
                        {t.naziv}
                      </span>
                      {t.podnaslov && (
                        <span className="block text-xs font-normal text-slate-400">{t.podnaslov}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap font-semibold">
                      {t.cena}
                      <span className="text-xs font-normal text-slate-400">{t.enota || ""}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {t.vkljuceno ? `${t.vkljuceno.split("\n").filter(Boolean).length} postavk` : "—"}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <CenikModal
          postavka={modal === "nov" ? null : modal}
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

function CenikModal({
  postavka,
  programi,
  onClose,
  onSaved,
}: {
  postavka: Postavka | null;
  programi: Program[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    program_slug: postavka?.program_slug || programi[0]?.slug || "",
    naziv: postavka?.naziv || "",
    podnaslov: postavka?.podnaslov || "",
    cena: postavka?.cena || "",
    enota: postavka?.enota || "",
    opomba: postavka?.opomba || "",
    vkljuceno: postavka?.vkljuceno || "",
    poudarjen: postavka?.poudarjen ?? false,
    aktiven: postavka?.aktiven ?? true,
    vrstni_red: postavka?.vrstni_red?.toString() || "0",
  });
  const [posiljam, setPosiljam] = useState(false);
  const [napaka, setNapaka] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");
    try {
      const res = await fetch("/api/cenik", {
        method: postavka ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: postavka?.id }),
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
          <h2 className="text-lg font-extrabold text-brand-navy">{postavka ? "Uredi postavko" : "Nova postavka cenika"}</h2>
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
            <label className={L}>Naslov kartice *</label>
            <input required value={form.naziv} onChange={(e) => setForm({ ...form, naziv: e.target.value })} className={I} placeholder="Športna abeceda" />
          </div>

          <div>
            <label className={L}>Podnaslov</label>
            <input value={form.podnaslov} onChange={(e) => setForm({ ...form, podnaslov: e.target.value })} className={I} placeholder="Za otroke od 3. leta naprej in prvo šolsko triado" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={L}>Cena *</label>
              <input required value={form.cena} onChange={(e) => setForm({ ...form, cena: e.target.value })} className={I} placeholder="30€" />
            </div>
            <div>
              <label className={L}>Enota</label>
              <input value={form.enota} onChange={(e) => setForm({ ...form, enota: e.target.value })} className={I} placeholder="/mesec" />
            </div>
          </div>

          <div>
            <label className={L}>Opomba pod ceno</label>
            <input value={form.opomba} onChange={(e) => setForm({ ...form, opomba: e.target.value })} className={I} placeholder="Cena z DDV" />
          </div>

          <div>
            <label className={L}>Kaj je vključeno — ena vrstica = ena kljukica</label>
            <textarea
              value={form.vkljuceno}
              onChange={(e) => setForm({ ...form, vkljuceno: e.target.value })}
              rows={6}
              className={`${I} resize-y font-mono text-xs`}
              placeholder={"Osnove gibanja, gimnastika, atletika\nIgre z žogo, borilni športi, ples\nIzkušen učitelj / animator\nVadbeni kartonček + štampiljke\nSpominska majica + diploma"}
            />
          </div>

          <div>
            <label className={L}>Vrstni red</label>
            <input type="number" value={form.vrstni_red} onChange={(e) => setForm({ ...form, vrstni_red: e.target.value })} className={I} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.poudarjen} onChange={(e) => setForm({ ...form, poudarjen: e.target.checked })} className="w-4 h-4 accent-brand-orange" />
            <span className="text-sm text-slate-700">Poudarjena kartica (npr. “Najbolj priljubljeno”)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.aktiven} onChange={(e) => setForm({ ...form, aktiven: e.target.checked })} className="w-4 h-4 accent-brand-orange" />
            <span className="text-sm text-slate-700">Vidna na spletni strani</span>
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
