"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Loader2,
  Mail,
  Check,
  AlertCircle,
  FlaskConical,
  Users,
} from "lucide-react";

type Kampanja = {
  id: number;
  zadeva: string;
  naslov: string | null;
  vsebina: string;
  filter_opis: string | null;
  prejemniki_st: number;
  poslano_st: number;
  status: string;
  ustvarjeno: string;
};

type Kontakt = { id: number; email: string; oznake: string; narocen: boolean };

export default function KampanjePage() {
  const [zadeva, setZadeva] = useState("");
  const [naslov, setNaslov] = useState("");
  const [vsebina, setVsebina] = useState("");
  const [oznaka, setOznaka] = useState("");
  const [samoNaroceni, setSamoNaroceni] = useState(true);
  const [kontakti, setKontakti] = useState<Kontakt[]>([]);
  const [kampanje, setKampanje] = useState<Kampanja[]>([]);
  const [testEmail, setTestEmail] = useState("");
  const [testStanje, setTestStanje] = useState<"" | "posiljam" | "poslano" | "napaka">("");
  const [posiljanje, setPosiljanje] = useState<{ skupaj: number; poslano: number } | null>(null);
  const [napaka, setNapaka] = useState("");

  const naloziKontakte = async () => {
    try {
      const d = await fetch("/api/admin/kontakti").then((r) => r.json());
      setKontakti(d.kontakti || []);
    } catch {}
  };
  const naloziKampanje = async () => {
    try {
      const d = await fetch("/api/admin/kampanje").then((r) => r.json());
      setKampanje(d.kampanje || []);
    } catch {}
  };

  useEffect(() => {
    naloziKontakte();
    naloziKampanje();
  }, []);

  const vseOznake = Array.from(
    new Set(kontakti.flatMap((k) => k.oznake.split(";").map((o) => o.trim()).filter(Boolean)))
  ).sort();

  const prejemnikiPreview = kontakti.filter(
    (k) => (!samoNaroceni || k.narocen) && (!oznaka || k.oznake.toLowerCase().includes(oznaka.toLowerCase()))
  );

  const posljiTest = async () => {
    if (!testEmail.trim() || !zadeva || !vsebina) return;
    setTestStanje("posiljam");
    try {
      const res = await fetch("/api/admin/kampanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zadeva, naslov, vsebina, testEmail: testEmail.trim() }),
      });
      setTestStanje(res.ok ? "poslano" : "napaka");
    } catch {
      setTestStanje("napaka");
    }
    setTimeout(() => setTestStanje(""), 3000);
  };

  const poslji = async () => {
    setNapaka("");
    if (!zadeva || !vsebina) return setNapaka("Vpiši zadevo in vsebino.");
    if (prejemnikiPreview.length === 0) return setNapaka("Ni prejemnikov za izbrane filtre.");
    if (!confirm(`Pošljem email "${zadeva}" na ${prejemnikiPreview.length} naslovov?`)) return;

    try {
      const res = await fetch("/api/admin/kampanje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zadeva, naslov, vsebina, oznaka, samoNaroceni }),
      });
      const d = await res.json();
      if (!res.ok) return setNapaka(d.error || "Napaka pri ustvarjanju kampanje.");

      const prejemniki: string[] = d.prejemniki || [];
      const kampanjaId = d.kampanja.id;
      setPosiljanje({ skupaj: prejemniki.length, poslano: 0 });

      let poslanoDoslej = 0;
      for (let i = 0; i < prejemniki.length; i += 50) {
        const paket = prejemniki.slice(i, i + 50);
        const koncano = i + 50 >= prejemniki.length;
        const r = await fetch("/api/admin/kampanje/poslji", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kampanjaId, zadeva, naslov, vsebina, prejemniki: paket, poslanoDoslej, koncano }),
        });
        const rd = await r.json();
        if (!r.ok) {
          setNapaka(`Napaka med pošiljanjem (poslano ${poslanoDoslej}): ${rd.error || ""}`);
          break;
        }
        poslanoDoslej = rd.skupaj;
        setPosiljanje({ skupaj: prejemniki.length, poslano: poslanoDoslej });
        // Resend omejitev: 2 zahtevka/s — počakamo malo med paketi
        await new Promise((res2) => setTimeout(res2, 700));
      }
      naloziKampanje();
    } catch (e: any) {
      setNapaka("Napaka pri povezavi.");
    }
  };

  const koncano = posiljanje && posiljanje.poslano >= posiljanje.skupaj;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy flex items-center gap-2 mb-1">
          <Send size={26} className="text-brand-orange" /> Emailing
        </h1>
        <p className="text-sm text-slate-600">
          Pošlji obvestilo vsem staršem iz baze kontaktov — vsem ali po oznakah (programih).
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sestavljanje */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1.5">Zadeva emaila *</label>
              <input
                value={zadeva}
                onChange={(e) => setZadeva(e.target.value)}
                placeholder="npr. Vpis v zimske tečaje 2026/27 je odprt!"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1.5">Naslov v emailu</label>
              <input
                value={naslov}
                onChange={(e) => setNaslov(e.target.value)}
                placeholder="npr. Pripravljeni na novo sezono?"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1.5">Vsebina *</label>
              <textarea
                value={vsebina}
                onChange={(e) => setVsebina(e.target.value)}
                rows={10}
                placeholder="Napiši sporočilo... Email bo oblikovan z logotipom in nogo Alpske šole, na dnu bo samodejno dodana povezava za odjavo."
                className="w-full px-4 py-3 rounded-lg border border-slate-200 outline-none text-sm resize-y focus:border-brand-orange"
              />
            </div>

            {/* Test */}
            <div className="flex flex-wrap gap-2 items-center border-t border-slate-100 pt-4">
              <FlaskConical size={16} className="text-slate-400" />
              <input
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tvoj@email.si za testni email"
                type="email"
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
              />
              <button
                onClick={posljiTest}
                disabled={testStanje === "posiljam" || !testEmail.trim() || !zadeva || !vsebina}
                className="inline-flex items-center gap-1.5 bg-white text-brand-navy border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 hover:border-slate-300"
              >
                {testStanje === "posiljam" ? <Loader2 size={14} className="animate-spin" /> : testStanje === "poslano" ? <Check size={14} className="text-green-600" /> : <Mail size={14} />}
                {testStanje === "poslano" ? "Poslano!" : "Pošlji test"}
              </button>
            </div>
          </div>

          {napaka && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-4 rounded-xl text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {napaka}
            </div>
          )}

          {posiljanje && (
            <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <strong className="text-brand-navy">
                  {koncano ? "✅ Poslano!" : "Pošiljam..."}
                </strong>
                <span className="text-slate-500">{posiljanje.poslano}/{posiljanje.skupaj}</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-orange transition-all"
                  style={{ width: `${posiljanje.skupaj ? (posiljanje.poslano / posiljanje.skupaj) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Prejemniki + pošlji */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
            <h2 className="text-sm font-bold text-brand-navy mb-3 flex items-center gap-2">
              <Users size={16} className="text-brand-orange" /> Prejemniki
            </h2>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Oznaka / program</label>
            <select
              value={oznaka}
              onChange={(e) => setOznaka(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white outline-none mb-3"
            >
              <option value="">Vsi kontakti</option>
              {vseOznake.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={samoNaroceni}
                onChange={(e) => setSamoNaroceni(e.target.checked)}
                className="w-4 h-4 accent-brand-orange"
              />
              Samo naročeni na obvestila
            </label>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center mb-4">
              <div className="text-3xl font-extrabold text-brand-navy">{prejemnikiPreview.length}</div>
              <div className="text-xs text-slate-600">prejemnikov</div>
            </div>
            <button
              onClick={poslji}
              disabled={!zadeva || !vsebina || prejemnikiPreview.length === 0 || (posiljanje !== null && !koncano)}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-brand-orange-dark"
            >
              <Send size={16} /> Pošlji vsem ({prejemnikiPreview.length})
            </button>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Najprej si pošlji testni email, da preveriš videz. Pošiljanje poteka v paketih — ne zapiraj strani, dokler ni končano.
            </p>
          </div>

          {/* Zgodovina */}
          <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
            <h2 className="text-sm font-bold text-brand-navy mb-3">Zadnje kampanje</h2>
            {kampanje.length === 0 ? (
              <p className="text-xs text-slate-400">Še ni poslanih kampanj.</p>
            ) : (
              <ul className="space-y-3">
                {kampanje.slice(0, 8).map((k) => (
                  <li key={k.id} className="text-sm border-b border-slate-100 pb-2 last:border-0">
                    <div className="font-semibold text-brand-navy truncate">{k.zadeva}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(k.ustvarjeno).toLocaleDateString("sl-SI")} · {k.poslano_st}/{k.prejemniki_st} poslanih
                      {k.filter_opis ? ` · ${k.filter_opis}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
