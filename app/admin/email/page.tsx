"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2, Save, Check, Inbox, BadgeCheck } from "lucide-react";

const LOGO = "https://www.alpskasola.com/alpska-logo.png";

type Predloga = { zadeva: string; naslov: string; vsebina: string };

const PRAZNA: Predloga = { zadeva: "", naslov: "", vsebina: "" };

export default function EmailPredlogaPage() {
  const [tip, setTip] = useState<"prejem" | "potrditev">("prejem");
  const [prejem, setPrejem] = useState<Predloga>(PRAZNA);
  const [potrditev, setPotrditev] = useState<Predloga>(PRAZNA);
  const [loading, setLoading] = useState(true);
  const [shranjujem, setShranjujem] = useState(false);
  const [shranjeno, setShranjeno] = useState(false);
  const [napaka, setNapaka] = useState("");

  useEffect(() => {
    fetch("/api/email-predloga")
      .then((r) => r.json())
      .then((d) => {
        setPrejem({
          zadeva: d.predloga?.zadeva || "",
          naslov: d.predloga?.naslov || "",
          vsebina: d.predloga?.vsebina || "",
        });
        setPotrditev({
          zadeva: d.potrditev?.zadeva || "",
          naslov: d.potrditev?.naslov || "",
          vsebina: d.potrditev?.vsebina || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const aktivna = tip === "prejem" ? prejem : potrditev;
  const nastavi = (sprememba: Partial<Predloga>) => {
    if (tip === "prejem") setPrejem({ ...prejem, ...sprememba });
    else setPotrditev({ ...potrditev, ...sprememba });
  };

  const shrani = async () => {
    setShranjujem(true);
    setNapaka("");
    setShranjeno(false);
    try {
      const res = await fetch("/api/email-predloga", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, ...aktivna }),
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
          Starš samodejno prejme email <strong>ob oddaji prijave</strong> in nato še{" "}
          <strong>ob potrditvi</strong> (ko prijavi v CRM nastaviš status „Potrjeno“).
          Za vsakega lahko urejaš zadevo, naslov in besedilo — logotip in noga sta vedno enaka.
        </p>
      </div>

      {/* Preklop med predlogama */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTip("prejem")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
            tip === "prejem"
              ? "bg-brand-navy text-white border-brand-navy"
              : "bg-white text-brand-navy border-slate-200 hover:border-brand-orange/50"
          }`}
        >
          <Inbox size={15} /> Ob oddaji prijave
        </button>
        <button
          onClick={() => setTip("potrditev")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${
            tip === "potrditev"
              ? "bg-brand-navy text-white border-brand-navy"
              : "bg-white text-brand-navy border-slate-200 hover:border-brand-orange/50"
          }`}
        >
          <BadgeCheck size={15} /> Ob potrditvi prijave
        </button>
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
                value={aktivna.zadeva}
                onChange={(e) => nastavi({ zadeva: e.target.value })}
                className={I}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                To starš vidi v nabiralniku kot naslov sporočila.
              </p>
            </div>

            <div>
              <label className={L}>Naslov v sporočilu</label>
              <input
                value={aktivna.naslov}
                onChange={(e) => nastavi({ naslov: e.target.value })}
                className={I}
              />
            </div>

            <div>
              <label className={L}>Besedilo</label>
              <textarea
                value={aktivna.vsebina}
                onChange={(e) => nastavi({ vsebina: e.target.value })}
                rows={7}
                className={`${I} resize-y`}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Za novo vrstico pritisnite Enter. Spodaj se samodejno doda povzetek prijave
                (program, termin, otrok, kontakt).
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
                <div className="px-6 py-5 border-b border-slate-100 text-center">
                  <img src={LOGO} alt="Alpska šola" className="h-10 w-auto inline-block" />
                </div>
                <div className="px-6 py-6">
                  <div className="text-lg font-extrabold text-brand-navy mb-2">
                    {aktivna.naslov || "…"}
                  </div>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-4">
                    {aktivna.vsebina || "…"}
                  </div>
                  <div
                    className={`rounded-xl border p-4 text-xs text-slate-500 ${
                      tip === "potrditev"
                        ? "bg-green-50 border-green-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    Tu se samodejno prikaže povzetek prijave (program, termin, cena, otrok,
                    starš, kontakt …)
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 leading-relaxed">
                  Alpska šola · Tepanje 60 · 064 230 888
                  <br />
                  <span className="text-brand-orange font-semibold">www.alpskasola.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
