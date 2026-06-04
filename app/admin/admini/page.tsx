"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, UserPlus, Trash2, Check, X } from "lucide-react";

type Admin = {
  id: number;
  ime: string;
  email: string;
  vloga: string;
  ustvarjeno: string;
};

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
        body: JSON.stringify({ ime, email, geslo, vloga }),
      });
      const d = await res.json();
      if (!res.ok) {
        setNapaka(d.error || "Napaka pri dodajanju.");
      } else {
        setIme("");
        setEmail("");
        setGeslo("");
        setVloga("zaposleni");
        setOdprt(false);
        nalozi();
      }
    } catch {
      setNapaka("Napaka pri povezavi.");
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
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
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
          <table className="w-full text-sm">
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
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">
                    {a.ustvarjeno ? new Date(a.ustvarjeno).toLocaleDateString("sl-SI") : ""}
                  </td>
                  <td className="px-6 py-3.5 text-right">
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
        )}
      </div>
    </div>
  );
}
