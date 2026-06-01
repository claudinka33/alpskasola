"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, X, AlertCircle } from "lucide-react";

type Program = {
  id: number;
  slug: string;
  naziv: string;
  opis: string | null;
  aktiven: boolean;
  cena_od: number | null;
};

export default function ProgramiPage() {
  const [programi, setProgrami] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [showNew, setShowNew] = useState(false);

  const nalozi = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/programi");
      const data = await res.json();
      setProgrami(data.programi || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const izbrisi = async (id: number) => {
    if (!confirm("Res želite izbrisati ta program?")) return;
    await fetch(`/api/programi?id=${id}`, { method: "DELETE" });
    nalozi();
  };

  const toggleAktiven = async (p: Program) => {
    await fetch("/api/programi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, aktiven: !p.aktiven }),
    });
    nalozi();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Programi</h1>
          <p className="text-sm text-slate-600">{programi.length} programov v sistemu</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
        >
          <Plus size={16} /> Nov program
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : programi.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm">Ni programov. Dodajte prvega.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/70">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Naziv</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Cena</th>
                  <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {programi.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{p.naziv}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">{p.slug}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.cena_od ? `${p.cena_od}€` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          p.aktiven ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.aktiven ? "AKTIVEN" : "SKRIT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => toggleAktiven(p)}
                          className="p-2 text-slate-500 hover:text-brand-orange transition-colors"
                          title={p.aktiven ? "Skrij" : "Pokaži"}
                        >
                          {p.aktiven ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingProgram(p)}
                          className="p-2 text-slate-500 hover:text-brand-orange transition-colors"
                          title="Uredi"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => izbrisi(p.id)}
                          className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                          title="Izbriši"
                        >
                          <Trash2 size={16} />
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

      {(showNew || editingProgram) && (
        <ProgramModal
          program={editingProgram}
          onClose={() => {
            setShowNew(false);
            setEditingProgram(null);
          }}
          onSaved={() => {
            setShowNew(false);
            setEditingProgram(null);
            nalozi();
          }}
        />
      )}
    </div>
  );
}

function ProgramModal({
  program,
  onClose,
  onSaved,
}: {
  program: Program | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    slug: program?.slug || "",
    naziv: program?.naziv || "",
    opis: program?.opis || "",
    cena_od: program?.cena_od?.toString() || "",
    aktiven: program?.aktiven ?? true,
  });
  const [posiljam, setPosiljam] = useState(false);
  const [napaka, setNapaka] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");
    try {
      const body = {
        ...form,
        cena_od: form.cena_od ? parseInt(form.cena_od) : null,
        id: program?.id,
      };
      const res = await fetch("/api/programi", {
        method: program ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setNapaka(data.error || "Napaka");
      } else {
        onSaved();
      }
    } catch {
      setNapaka("Napaka pri povezavi");
    } finally {
      setPosiljam(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-brand-navy">
            {program ? "Uredi program" : "Nov program"}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Naziv *</label>
            <input
              type="text"
              required
              value={form.naziv}
              onChange={(e) => setForm({ ...form, naziv: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm"
              placeholder="Tečaj smučanja 2026"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Slug * (kratko ime brez šumnikov in presledkov)
            </label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-"),
                })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm font-mono"
              placeholder="tecaj-smucanja-2026"
              disabled={!!program}
            />
            {program && (
              <p className="text-xs text-slate-400 mt-1">Slug obstoječega programa ni mogoče spreminjati.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Opis</label>
            <textarea
              value={form.opis}
              onChange={(e) => setForm({ ...form, opis: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cena od (€)</label>
            <input
              type="number"
              value={form.cena_od}
              onChange={(e) => setForm({ ...form, cena_od: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.aktiven}
              onChange={(e) => setForm({ ...form, aktiven: e.target.checked })}
              className="w-4 h-4 accent-brand-orange"
            />
            <span className="text-sm text-slate-700">Aktiven (prikazan v prijavnem obrazcu)</span>
          </label>

          {napaka && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{napaka}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200"
            >
              Prekliči
            </button>
            <button
              type="submit"
              disabled={posiljam}
              className="flex-1 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {posiljam ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Shranjujem...
                </>
              ) : (
                "Shrani"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
