"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, UserPlus, Trash2, Check, X, KeyRound, Pencil, ShieldCheck } from "lucide-react";
import { RAZDELKI, PRIVZETE_ZAPOSLENI } from "@/lib/pravice";

type Admin = {
  id: number;
  ime: string;
  email: string;
  vloga: string;
  pravice: string | null;
  ustvarjeno: string;
};

// Razdelki, razvrščeni po skupinah — za izbiro pravic
const PO_SKUPINAH = RAZDELKI.reduce((m: Record<string, typeof RAZDELKI>, r) => {
  (m[r.skupina] ??= []).push(r);
  return m;
}, {});

function razcleni(p: string | null): string[] {
  try {
    return p ? JSON.parse(p) : [];
  } catch {
    return [];
  }
}

export default function UporabnikiPage() {
  const [admini, setAdmini] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [odprt, setOdprt] = useState(false);
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState("");
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const [vloga, setVloga] = useState("zaposleni");
  const [novePravice, setNovePravice] = useState<string[]>(PRIVZETE_ZAPOSLENI);
  const [urejam, setUrejam] = useState<Admin | null>(null);

  const nalozi = async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/admin/admini").then((r) => r.json());
      setAdmini(d.admini || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    nalozi();
  }, []);

  const dodaj = async () => {
    setShranjujem(true);
    setNapaka("");
    try {
      const res = await fetch("/api/admin/admini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, email, geslo, vloga, pravice: novePravice }),
      });
      const d = await res.json();
      if (!res.ok) {
        setNapaka(d.error || "Napaka pri dodajanju.");
      } else {
        setIme("");
        setEmail("");
        setGeslo("");
        setVloga("zaposleni");
        setNovePravice(PRIVZETE_ZAPOSLENI);
        setOdprt(false);
        nalozi();
      }
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setShranjujem(false);
    }
  };

  const [gesloZa, setGesloZa] = useState<Admin | null>(null);
  const [novoGeslo, setNovoGeslo] = useState("");
  const [gesloNapaka, setGesloNapaka] = useState("");
  const [gesloShranjeno, setGesloShranjeno] = useState(false);

  const zamenjajGeslo = async () => {
    if (!gesloZa) return;
    setGesloNapaka("");
    setShranjujem(true);
    try {
      const res = await fetch("/api/admin/admini", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: gesloZa.id, geslo: novoGeslo }),
      });
      const d = await res.json();
      if (!res.ok) setGesloNapaka(d.error || "Napaka.");
      else {
        setGesloShranjeno(true);
        setTimeout(() => {
          setGesloZa(null);
          setNovoGeslo("");
          setGesloShranjeno(false);
        }, 1500);
      }
    } catch {
      setGesloNapaka("Napaka pri povezavi.");
    } finally {
      setShranjujem(false);
    }
  };

  const izbrisi = async (a: Admin) => {
    if (!confirm(`Izbrišem uporabnika ${a.ime} (${a.email})?`)) return;
    try {
      const res = await fetch(`/api/admin/admini?id=${a.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) alert(d.error || "Napaka pri brisanju.");
      else nalozi();
    } catch {
      alert("Napaka pri povezavi.");
    }
  };

  const I =
    "w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2">
            <Users size={26} className="text-brand-orange" /> Uporabniki
          </h1>
          <p className="text-sm text-slate-600 mt-1">Uporabniki z dostopom do CMS-ja.</p>
        </div>
        <button
          onClick={() => {
            setOdprt((v) => !v);
            setNapaka("");
          }}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap"
        >
          {odprt ? <X size={16} /> : <UserPlus size={16} />}
          {odprt ? "Prekliči" : "Nov uporabnik"}
        </button>
      </div>

      {/* Obrazec za dodajanje */}
      {odprt && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-6">
          <h2 className="text-lg font-bold text-brand-navy mb-4">Nov uporabnik</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ime in priimek</label>
              <input value={ime} onChange={(e) => setIme(e.target.value)} className={I} placeholder="Zoja Novak" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className={I} placeholder="zoja@alpskasola.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Geslo</label>
              <input value={geslo} onChange={(e) => setGeslo(e.target.value)} className={I} placeholder="vsaj 6 znakov" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vloga</label>
              <select value={vloga} onChange={(e) => setVloga(e.target.value)} className={`${I} bg-white`}>
                <option value="zaposleni">Zaposleni</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {vloga !== "admin" && (
            <div className="mt-5">
              <div className="text-xs font-bold text-slate-600 mb-2">Kaj sme videti</div>
              <IzbiraPravic izbrane={novePravice} nastavi={setNovePravice} />
            </div>
          )}
          {vloga === "admin" && (
            <p className="mt-5 text-xs text-slate-500 bg-orange-50/60 border border-orange-200 rounded-lg p-3">
              Skrbnik vidi vse razdelke in lahko ureja uporabnike.
            </p>
          )}

          {napaka && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mt-4">{napaka}</div>
          )}

          <button
            onClick={dodaj}
            disabled={shranjujem}
            className="mt-4 inline-flex items-center justify-center gap-2 bg-brand-navy text-white px-5 py-2.5 rounded-xl font-bold disabled:opacity-50"
          >
            {shranjujem ? <><Loader2 size={16} className="animate-spin" /> Dodajam…</> : <><Check size={16} /> Dodaj uporabnika</>}
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="px-6 py-3">Ime</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Vloga</th>
                <th className="px-6 py-3">Ustvarjeno</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admini.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-3.5 font-semibold text-brand-navy">{a.ime}</td>
                  <td className="px-6 py-3.5 text-slate-600">{a.email}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        a.vloga === "admin"
                          ? "bg-orange-100 text-brand-orange"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.vloga === "admin" ? "ADMIN" : "ZAPOSLENI"}
                    </span>
                    {a.vloga !== "admin" && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        {razcleni(a.pravice).length === 0
                          ? "brez razdelkov"
                          : `${razcleni(a.pravice).length} razdelkov`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {a.ustvarjeno ? new Date(a.ustvarjeno).toLocaleDateString("sl-SI") : ""}
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setUrejam(a)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors mr-4"
                    >
                      <Pencil size={14} /> Uredi
                    </button>
                    <button
                      onClick={() => {
                        setGesloZa(a);
                        setNovoGeslo("");
                        setGesloNapaka("");
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-orange transition-colors mr-4"
                    >
                      <KeyRound size={14} /> Zamenjaj geslo
                    </button>
                    <button
                      onClick={() => izbrisi(a)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      aria-label="Izbriši"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {urejam && (
        <UrediModal
          admin={urejam}
          onClose={() => setUrejam(null)}
          onShranjeno={() => {
            setUrejam(null);
            nalozi();
          }}
        />
      )}

      {/* Modal: zamenjaj geslo */}
      {gesloZa && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setGesloZa(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <h2 className="text-lg font-extrabold text-brand-navy mb-1 flex items-center gap-2">
              <KeyRound size={18} className="text-brand-orange" /> Zamenjaj geslo
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {gesloZa.ime} · {gesloZa.email}
            </p>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Novo geslo (vsaj 6 znakov)</label>
            <input
              type="text"
              value={novoGeslo}
              onChange={(e) => setNovoGeslo(e.target.value)}
              className={I}
              autoFocus
            />
            {gesloNapaka && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mt-3">{gesloNapaka}</div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={zamenjajGeslo}
                disabled={shranjujem || novoGeslo.length < 6}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold disabled:opacity-50"
              >
                {shranjujem ? <Loader2 size={16} className="animate-spin" /> : gesloShranjeno ? <Check size={16} /> : <KeyRound size={16} />}
                {gesloShranjeno ? "Shranjeno!" : "Shrani geslo"}
              </button>
              <button
                onClick={() => setGesloZa(null)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 border border-slate-200"
              >
                Prekliči
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IzbiraPravic({
  izbrane,
  nastavi,
}: {
  izbrane: string[];
  nastavi: (p: string[]) => void;
}) {
  const preklopi = (k: string) =>
    nastavi(izbrane.includes(k) ? izbrane.filter((x) => x !== k) : [...izbrane, k]);

  return (
    <div className="space-y-4">
      {Object.entries(PO_SKUPINAH).map(([skupina, razdelki]) => (
        <div key={skupina}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {skupina}
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {razdelki.map((r) => (
              <label
                key={r.kljuc}
                className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer ${
                  izbrane.includes(r.kljuc)
                    ? "border-brand-orange bg-orange-50/50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={izbrane.includes(r.kljuc)}
                  onChange={() => preklopi(r.kljuc)}
                  className="w-4 h-4 accent-brand-orange mt-0.5 shrink-0"
                />
                <span>
                  <span className="block text-sm font-semibold text-brand-navy leading-snug">
                    {r.naziv}
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-snug">{r.opis}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UrediModal({
  admin,
  onClose,
  onShranjeno,
}: {
  admin: Admin;
  onClose: () => void;
  onShranjeno: () => void;
}) {
  const [ime, setIme] = useState(admin.ime);
  const [email, setEmail] = useState(admin.email);
  const [vloga, setVloga] = useState(admin.vloga);
  const [pravice, setPravice] = useState<string[]>(razcleni(admin.pravice));
  const [shranjujem, setShranjujem] = useState(false);
  const [napaka, setNapaka] = useState("");

  const I =
    "w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm";

  const shrani = async () => {
    setShranjujem(true);
    setNapaka("");
    try {
      const res = await fetch("/api/admin/admini", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: admin.id, ime, email, vloga, pravice }),
      });
      const d = await res.json();
      if (!res.ok) setNapaka(d.error || "Napaka pri shranjevanju.");
      else onShranjeno();
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setShranjujem(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-2xl p-6 my-8"
      >
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-lg font-extrabold text-brand-navy">Uredi uporabnika</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Ime in priimek</label>
            <input value={ime} onChange={(e) => setIme(e.target.value)} className={I} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={I} />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vloga</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              ["zaposleni", "Zaposleni", "Vidi samo, kar mu dodeliš"],
              ["admin", "Skrbnik", "Vidi vse in ureja uporabnike"],
            ].map(([v, l, o]) => (
              <button
                key={v}
                type="button"
                onClick={() => setVloga(v)}
                className={`text-left rounded-xl border-2 px-4 py-3 ${
                  vloga === v ? "border-brand-orange bg-orange-50/60" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                  {v === "admin" && <ShieldCheck size={14} className="text-brand-orange" />}
                  {l}
                </div>
                <div className="text-[11px] text-slate-500">{o}</div>
              </button>
            ))}
          </div>
        </div>

        {vloga === "admin" ? (
          <p className="text-xs text-slate-500 bg-orange-50/60 border border-orange-200 rounded-lg p-3 mb-5">
            Skrbnik vidi vse razdelke, zato posebnih pravic ni treba nastavljati.
          </p>
        ) : (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-slate-600">Kaj sme videti</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPravice(RAZDELKI.map((r) => r.kljuc))}
                  className="text-[11px] font-bold text-brand-orange hover:underline"
                >
                  Označi vse
                </button>
                <button
                  type="button"
                  onClick={() => setPravice([])}
                  className="text-[11px] font-bold text-slate-400 hover:underline"
                >
                  Počisti
                </button>
              </div>
            </div>
            <IzbiraPravic izbrane={pravice} nastavi={setPravice} />
          </div>
        )}

        {napaka && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">{napaka}</div>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200"
          >
            Prekliči
          </button>
          <button
            onClick={shrani}
            disabled={shranjujem}
            className="flex-1 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {shranjujem ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Shrani
          </button>
        </div>
      </div>
    </div>
  );
}
