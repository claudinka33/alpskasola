"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, AlertCircle, Pencil, Trash2, Cake, Eye, EyeOff } from "lucide-react";

type Paket = {
  id: number;
  value: string;
  label: string;
  opis: string | null;
  ima_aktivnosti: boolean;
  aktiven: boolean;
  vrstni_red: number;
};
type Aktivnost = { id: number; label: string; aktiven: boolean; vrstni_red: number };

export default function RojstniDanPage() {
  const [paketi, setPaketi] = useState<Paket[]>([]);
  const [aktivnosti, setAktivnosti] = useState<Aktivnost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ tip: "paket" | "aktivnost"; data: any } | null>(null);

  const nalozi = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/rd-config").then((r) => r.json());
      setPaketi(d.paketi || []);
      setAktivnosti(d.aktivnosti || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const preklopi = async (tip: "paket" | "aktivnost", row: any) => {
    await fetch("/api/rd-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...row, tip, aktiven: !row.aktiven }),
    });
    nalozi();
  };

  const izbrisi = async (tip: "paket" | "aktivnost", row: any) => {
    if (!confirm(`Izbrišem "${row.label}"?`)) return;
    await fetch(`/api/rd-config?tip=${tip}&id=${row.id}`, { method: "DELETE" });
    nalozi();
  };

  const Badge = ({ aktiven }: { aktiven: boolean }) => (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${aktiven ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"}`}>
      {aktiven ? "VIDEN" : "SKRIT"}
    </span>
  );

  const Akcije = ({ tip, row }: { tip: "paket" | "aktivnost"; row: any }) => (
    <div className="inline-flex gap-1">
      <button onClick={() => preklopi(tip, row)} title={row.aktiven ? "Skrij" : "Pokaži"} className="p-2 text-slate-500 hover:text-brand-orange">
        {row.aktiven ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button onClick={() => setModal({ tip, data: row })} title="Uredi" className="p-2 text-slate-500 hover:text-brand-orange">
        <Pencil size={15} />
      </button>
      <button onClick={() => izbrisi(tip, row)} title="Izbriši" className="p-2 text-slate-500 hover:text-red-600">
        <Trash2 size={15} />
      </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2 mb-1">
        <Cake size={26} className="text-brand-orange" /> Rojstni dan
      </h1>
      <p className="text-sm text-slate-600 mb-6">
        Uredi pakete in aktivnosti, ki jih starši vidijo na prijavnici za rojstni dan.
      </p>

      {loading ? (
        <div className="py-16 text-center"><Loader2 size={32} className="animate-spin text-brand-orange mx-auto" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PAKETI */}
          <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-brand-navy">Paketi</h2>
              <button onClick={() => setModal({ tip: "paket", data: null })} className="inline-flex items-center gap-1.5 bg-brand-orange text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-orange-dark">
                <Plus size={14} /> Nov paket
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {paketi.length === 0 && <div className="p-6 text-sm text-slate-400 text-center">Ni paketov.</div>}
              {paketi.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand-navy truncate">{p.label}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge aktiven={p.aktiven} />
                      {p.ima_aktivnosti && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-brand-orange">+ aktivnosti</span>
                      )}
                    </div>
                  </div>
                  <Akcije tip="paket" row={p} />
                </div>
              ))}
            </div>
          </div>

          {/* AKTIVNOSTI */}
          <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-brand-navy">Aktivnosti</h2>
                <p className="text-[11px] text-slate-400">Prikažejo se pri paketih z oznako “+ aktivnosti”.</p>
              </div>
              <button onClick={() => setModal({ tip: "aktivnost", data: null })} className="inline-flex items-center gap-1.5 bg-brand-orange text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-orange-dark">
                <Plus size={14} /> Nova
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {aktivnosti.length === 0 && <div className="p-6 text-sm text-slate-400 text-center">Ni aktivnosti.</div>}
              {aktivnosti.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-navy truncate">{a.label}</span>
                    <Badge aktiven={a.aktiven} />
                  </div>
                  <Akcije tip="aktivnost" row={a} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <RdModal
          tip={modal.tip}
          data={modal.data}
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

function RdModal({
  tip,
  data,
  onClose,
  onSaved,
}: {
  tip: "paket" | "aktivnost";
  data: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const jePaket = tip === "paket";
  const [form, setForm] = useState({
    value: data?.value || "",
    label: data?.label || "",
    opis: data?.opis || "",
    ima_aktivnosti: data?.ima_aktivnosti ?? false,
    aktiven: data?.aktiven ?? true,
    vrstni_red: data?.vrstni_red?.toString() || "0",
  });
  const [posiljam, setPosiljam] = useState(false);
  const [napaka, setNapaka] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");
    try {
      const res = await fetch("/api/rd-config", {
        method: data ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tip, id: data?.id }),
      });
      const r = await res.json();
      if (!res.ok) setNapaka(r.error || "Napaka");
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
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-brand-navy">
            {data ? "Uredi" : "Nov"} {jePaket ? "paket" : "aktivnost"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className={L}>Naziv *</label>
            <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={I} placeholder={jePaket ? "Športna norišnica na prostem" : "Med dvema ognjema"} />
          </div>

          {jePaket && (
            <>
              {!data && (
                <div>
                  <label className={L}>Koda (brez šumnikov/presledkov) *</label>
                  <input
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    className={`${I} font-mono`}
                    placeholder="sportna"
                  />
                </div>
              )}
              <div>
                <label className={L}>Opis</label>
                <textarea value={form.opis} onChange={(e) => setForm({ ...form, opis: e.target.value })} rows={2} className={`${I} resize-y`} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.ima_aktivnosti} onChange={(e) => setForm({ ...form, ima_aktivnosti: e.target.checked })} className="w-4 h-4 accent-brand-orange" />
                <span className="text-sm text-slate-700">Starš pri tem paketu izbere aktivnosti</span>
              </label>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className={L}>Vrstni red</label>
              <input type="number" value={form.vrstni_red} onChange={(e) => setForm({ ...form, vrstni_red: e.target.value })} className={I} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
              <input type="checkbox" checked={form.aktiven} onChange={(e) => setForm({ ...form, aktiven: e.target.checked })} className="w-4 h-4 accent-brand-orange" />
              <span className="text-sm text-slate-700">Aktiven</span>
            </label>
          </div>

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
