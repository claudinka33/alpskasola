"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Tecaj = {
  id: string;
  zavihek: string;
  naslov: string;
  starost: string;
  opis: string[];
  poudarki: string[];
  slika: string;
  slikaAlt: string;
};

// TODO: slike so začasne — zamenjaj z novimi fotografijami, ko jih dobimo
const tecaji: Tecaj[] = [
  {
    id: "alpska",
    zavihek: "Alpska šola tečaj",
    naslov: "Alpska šola — tečaj smučanja",
    starost: "6 let in več",
    opis: [
      "Tečaj za otroke od 6. leta naprej, ki se smučanja učijo prvič ali svoje znanje nadgrajujejo. Začnemo s spoznavanjem in prilagajanjem na opremo, igrami na snegu, drsenjem po hribu, zavijanjem in uporabo žičnice.",
      "Tisti, ki so z osnovami že seznanjeni, se učijo pravilne smučarske tehnike — osnovno vijuganje, ritem smučanja, uporaba palic, smučanje v celcu in v snežnem parku.",
    ],
    poudarki: [
      "Paket 8 sobot, od 9h do 15h",
      "Organiziran prevoz iz Celja in Zreč",
      "Kosilo s čajem v hotelu Planja",
      "Skupine do 6 otrok na učitelja",
    ],
    slika: "/smucanje.jpg",
    slikaAlt: "Alpska šola — tečaj smučanja",
  },
  {
    id: "bordanje",
    zavihek: "Tečaj bordanja",
    naslov: "Tečaj bordanja",
    starost: "5 let in več",
    opis: [
      "Za vse mlade deskarje od 5. leta naprej. Najprej se spoznamo z desko in opremo, se naučimo pravilnega padanja in vstajanja ter drsenja po blagem naklonu.",
      "Sledijo osnovni zavoji, vožnja z vlečnico in sedežnico ter nadgradnja tehnike — od prvih zavojev do samostojne in varne vožnje po urejenih progah.",
    ],
    poudarki: [
      "Paket 8 sobot, od 9h do 15h",
      "Organiziran prevoz iz Celja in Zreč",
      "Kosilo s čajem v hotelu Planja",
      "Učenje po korakih, prilagojeno znanju",
    ],
    slika: "/zimskeaktivnosti.jpeg",
    slikaAlt: "Tečaj bordanja",
  },
  {
    id: "mini",
    zavihek: "Mini alpska šola",
    naslov: "Mini alpska šola",
    starost: "4 – 6 let",
    opis: [
      "Program, prilagojen najmlajšim smučarjem od 4. do 6. leta. Skozi igro na snegu se otroci navadijo na smučarsko opremo, naredijo prve zavoje in osvojijo vožnjo z žičnico.",
      "Urnik je krajši in prilagojen zbranosti malčkov — smučamo ob sobotah od 9.30 do 13.00, sezono pa zaključimo s prireditvijo in podelitvijo medalj.",
    ],
    poudarki: [
      "Paket 6 sobot + zaključna prireditev",
      "Smučamo ob sobotah 9.30 – 13.00",
      "Medalja in FIS brošura",
      "Učenje skozi igro v majhnih skupinah",
    ],
    slika: "/skupinska.jpg",
    slikaAlt: "Mini alpska šola",
  },
];

export default function SmucanjeTabs() {
  const [aktiven, setAktiven] = useState(0);
  const t = tecaji[aktiven];

  return (
    <section className="bg-white py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Zavihki */}
        <div
          role="tablist"
          aria-label="Tečaji"
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {tecaji.map((tecaj, i) => (
            <button
              key={tecaj.id}
              role="tab"
              aria-selected={aktiven === i}
              onClick={() => setAktiven(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-colors border-2 ${
                aktiven === i
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-brand-navy border-slate-200 hover:border-brand-orange/60"
              }`}
            >
              {tecaj.zavihek}
            </button>
          ))}
        </div>

        {/* Vsebina zavihka */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-orange-100 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-3">
              🎿 {t.starost}
            </div>
            <h2 className="text-3xl font-extrabold text-brand-navy mb-4 leading-tight">
              {t.naslov}
            </h2>
            {t.opis.map((p, i) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            <ul className="space-y-2 mt-2">
              {t.poudarki.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <span className="text-slate-700">{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10 aspect-video">
            <img
              src={t.slika}
              alt={t.slikaAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
