"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, Save, Check } from "lucide-react";

const LOGO = "https://alpskasola.vercel.app/alpska-logo.png";

export default function EmailPredlogaPage() {
  const [zadeva, setZadeva] = useState("");
  const [naslov, setNaslov] = useState("");
  const [vsebina, setVsebina] = useState("");
  const [loading, setLoading] = useState(true);
  const [shranjujem, setShranjujem] = useState(false);
  const [shranjeno, setShranjeno] = useState(false);
  const [napaka, setNapaka] = useState("");

  useEffect(() => {
    fetch("/api/email-predloga")
      .then((r) => r.json())
      .then((d) => {
        const p = d.predloga || {};
        setZadeva(p.zadeva || "");
        setNaslov(p.naslov || "");
        setVsebina(p.vsebina || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shrani = async () => {
    setShranjujem(true);
    setNapaka("");
    setShranjeno(false);
    try {
      const res = await fetch("/api/email-predloga", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zadeva, naslov, vsebina }),
      });
      const d = await res.json();
      if (!res.ok) setNapaka(d.error || "Napaka pri shranjevanju.");
      else {
        setShranjeno(true);
        setTimeout(() => setShranjeno(false), 2500);
      }
    } catch {
      setNapaka("Napaka pri povezavi.");
    } finally {
      setShranjujem(false);
    }
  };

  const L = "block text-xs font-semibold text-slate-600 mb-1.5";
  const I =
    "w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-brand-orange outline-none text-sm";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2">
          <Mail size={26} className="text-brand-orange" /> Sporočilo staršem
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          To je potrditveni email, ki ga starš samodejno prejme po oddani prijavi. Urejaš lahko
          <strong> zadevo, naslov in besedilo</strong>. Logotip, naslov „Alpska šola, Tepanje 60“
          in spletna stran ostanejo vedno enaki.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 size={32} className="animate-spin text-brand-orange mx-auto" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* UREJANJE */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 space-y-4">
            <div>
              <label className={L}>Zadeva e-pošte</label>
              <input
                value={zadeva}
                onChange={(e) => setZadeva(e.target.value)}
                className={I}
                placeholder="Prejeli smo vašo prijavo"
              />
              <p className="text-[11px] text-slate-400 mt-1">To starš vidi v nabiralniku kot naslov sporočila.</p>
            </div>

            <div>
              <label className={L}>Naslov v sporočilu</label>
              <input
                value={naslov}
                onChange={(e) => setNaslov(e.target.value)}
                className={I}
                placeholder="Hvala za prijavo!"
              />
            </div>

            <div>
              <label className={L}>Besedilo</label>
              <textarea
                value={vsebina}
                onChange={(e) => setVsebina(e.target.value)}
                rows={7}
                className={`${I} resize-y`}
                placeholder="Napišite sporočilo staršu…"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Za novo vrstico pritisnite Enter. Spodaj se samodejno doda povzetek prijave.
              </p>
            </div>

            {napaka && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{napaka}</div>
            )}

            <button
              onClick={shrani}
              disabled={shranjujem}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {shranjujem ? (
                <><Loader2 size={16} className="animate-spin" /> Shranjujem…</>
              ) : shranjeno ? (
                <><Check size={16} /> Shranjeno!</>
              ) : (
                <><Save size={16} /> Shrani spremembe</>
              )}
            </button>
          </div>

          {/* PREDOGLED */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Predogled (kako vidi starš)
            </div>
            <div className="bg-slate-100 rounded-2xl p-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* glava z logotipom */}
                <div className="px-6 py-5 border-b border-slate-100 text-center">
                  <img src={LOGO} alt="Alpska šola" className="h-11 w-auto inline-block" />
                </div>
                {/* vsebina */}
                <div className="p-6">
                  <div className="text-brand-navy text-xl font-extrabold mb-3">
                    {naslov || "Hvala za prijavo!"}
                  </div>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line mb-4">
                    {vsebina || "Vašo prijavo smo uspešno prejeli…"}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px]">
                    {[
                      ["Program", "Tečaj plavanja"],
                      ["Termin", "Plavalni tečaj v Juniju 2026"],
                      ["Cena", "130 €"],
                      ["Otrok", "Ana Novak"],
                      ["Starš", "Maja Novak"],
                      ["Telefon", "041 123 456"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1">
                        <span className="text-slate-500">{k}</span>
                        <span className="text-brand-navy font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-4">
                    Za vprašanja nas pokličite na <strong className="text-brand-navy">064 230 888</strong> ali odgovorite na ta email.
                  </p>
                </div>
                {/* noga (fiksno) */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400 leading-relaxed">
                  Alpska šola · Tepanje 60 · 064 230 888<br />
                  <span className="text-brand-orange font-semibold">www.alpskasola.com</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Povzetek prijave (program, otrok, termin…) se izpolni samodejno za vsako prijavo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
