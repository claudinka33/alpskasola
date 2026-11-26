// Skupna predloga za podstrani tečajev (Alpska šola smučanja, Alpska šola bordanja, Mini alpska šola).
// Besedila in slike so v datoteki posamezne strani (app/<program>/page.tsx),
// termini in cenik pa se berejo iz CMS-a po programSlug.

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import ProgramCta from "@/components/ProgramCta";
import TerminiSekcija from "@/components/TerminiSekcija";
import CenikSekcija from "@/components/CenikSekcija";
import GalerijaSekcija from "@/components/GalerijaSekcija";
import type { Slika } from "@/components/GalerijaMreza";
import { Check, ArrowRight, type LucideIcon } from "lucide-react";

export type TecajVsebina = {
  programSlug: string;
  hero: { badge: string; naslov: string; podnaslov: string };
  uvod: {
    znacka: string; // npr. "6 let in več"
    naslov: string;
    odstavki: string[];
    poudarki: string[];
    slika: string;
    slikaAlt: string;
  };
  fakti: { icon: LucideIcon; naslov: string; besedilo: string }[];
  // Sekcija "Kaj se naučijo" — koraki/stopnje
  koraki?: { naslov: string; opis: string }[];
  // Galerija (enaka kot pri akademiji). Privzete slike iz /public — v CMS (/admin/galerija)
  // jih lahko zamenjaš; ko so za program v CMS-u slike, se pokažejo te.
  galerija?: { naslov: string; podnaslov: string; slike: Slika[] };
  vprasanja: { v: string; o: string }[];
  cta: { naslov: string; podnaslov: string };
};

export default function TecajStran({ v }: { v: TecajVsebina }) {
  const prijavaHref = `/prijava?program=${v.programSlug}`;

  return (
    <main>
      <Navbar />
      <PageHero badge={v.hero.badge} title={v.hero.naslov} subtitle={v.hero.podnaslov} />

      {/* Uvod */}
      <section className="bg-white py-10 lg:py-16">
        <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 lg:gap-14 items-center">
          <div>
            <div className="inline-block bg-orange-100 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-3">
              {v.uvod.znacka}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy mb-4 leading-tight">
              {v.uvod.naslov}
            </h2>
            {v.uvod.odstavki.map((p, i) => (
              <p key={i} className="text-slate-600 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            <ul className="space-y-2 mt-2">
              {v.uvod.poudarki.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check size={16} className="text-brand-orange shrink-0 mt-0.5" />
                  <span className="text-slate-700">{p}</span>
                </li>
              ))}
            </ul>
            <Link
              href={prijavaHref}
              className="inline-flex items-center gap-2 mt-6 bg-brand-orange text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-brand-orange-dark transition-colors"
            >
              Prijavi se <ArrowRight size={16} />
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-brand-navy/10 aspect-[4/3]">
            <img src={v.uvod.slika} alt={v.uvod.slikaAlt} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Fakti */}
      <section className="bg-blue-50/40 py-14 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {v.fakti.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-200/70 text-center">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-orange mx-auto mb-3 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <strong className="block text-sm font-bold text-brand-navy mb-1">{f.naslov}</strong>
                  <span className="text-xs text-slate-600">{f.besedilo}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Kaj se naučijo */}
      {v.koraki && v.koraki.length > 0 && (
        <section className="bg-white py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
                <span className="w-6 h-px bg-brand-orange" />
                Program tečaja
                <span className="w-6 h-px bg-brand-orange" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">Kaj se naučijo</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {v.koraki.map((k, i) => (
                <div key={i} className="rounded-xl p-5 border border-slate-200/70 bg-white">
                  <div className="w-9 h-9 rounded-full bg-brand-navy text-white text-sm font-bold flex items-center justify-center mb-3">
                    {i + 1}
                  </div>
                  <strong className="block text-brand-navy mb-1">{k.naslov}</strong>
                  <p className="text-sm text-slate-600 leading-relaxed">{k.opis}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galerija fotografij — ureja se v CMS: /admin/galerija */}
      {v.galerija && (
        <GalerijaSekcija
          programSlug={v.programSlug}
          samo="slike"
          fotoNaslov={v.galerija.naslov}
          fotoPodnaslov={v.galerija.podnaslov}
          privzeteSlike={v.galerija.slike}
        />
      )}

      {/* Termini — ureja se v CMS: /admin/termini */}
      <TerminiSekcija programSlug={v.programSlug} badge="Kje in kdaj" naslov="Termini" />

      {/* Cenik — ureja se v CMS: /admin/cenik */}
      <CenikSekcija programSlug={v.programSlug} />

      {/* FAQ */}
      <section className="bg-blue-50/40 py-12 lg:py-16 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-navy mb-2">Pogosta vprašanja</h2>
            <p className="text-sm text-slate-600">Vse, kar morate vedeti pred prijavo.</p>
          </div>
          <div className="space-y-3">
            {v.vprasanja.map((q, i) => (
              <details key={i} className="bg-white rounded-xl border border-slate-200/70 group">
                <summary className="px-5 py-4 cursor-pointer font-semibold text-brand-navy flex items-center justify-between hover:bg-slate-50 transition-colors">
                  {q.v}
                  <span className="text-brand-orange group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{q.o}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ProgramCta programSlug={v.programSlug} title={v.cta.naslov} subtitle={v.cta.podnaslov} />
      <Footer />
    </main>
  );
}
