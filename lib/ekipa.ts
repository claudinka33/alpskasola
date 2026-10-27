// lib/ekipa.ts — tekmovalna ekipa: otroci, treningi/tekme in prisotnost.
// Popolnoma ločeno od ostalih vadb (srecanja/prisotnost). Tabele se ustvarijo same.

import { sql } from "@vercel/postgres";

let izvedeno = false;

export async function zagotoviEkipo() {
  if (izvedeno) return;

  await sql`
    CREATE TABLE IF NOT EXISTS ekipa_otroci (
      id SERIAL PRIMARY KEY,
      ime TEXT NOT NULL,
      ekipa TEXT NOT NULL DEFAULT 'U10/U12',
      aktiven BOOLEAN NOT NULL DEFAULT true,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  // En dan = en zapis na ekipo. tip: trening | tekma
  // voznja: 'fraj;proga'  discipline: 'VSL;SL;SG;Freestyle'  pogoji: odlicni | dobri | slabi
  await sql`
    CREATE TABLE IF NOT EXISTS ekipa_treningi (
      id SERIAL PRIMARY KEY,
      ekipa TEXT NOT NULL,
      datum DATE NOT NULL,
      tip TEXT NOT NULL DEFAULT 'trening',
      voznja TEXT NOT NULL DEFAULT '',
      discipline TEXT NOT NULL DEFAULT '',
      pogoji TEXT NOT NULL DEFAULT '',
      trenerji TEXT NOT NULL DEFAULT '',
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (ekipa, datum)
    );`;

  await sql`
    CREATE TABLE IF NOT EXISTS ekipa_prisotnost (
      trening_id INT NOT NULL REFERENCES ekipa_treningi(id) ON DELETE CASCADE,
      otrok_id INT NOT NULL REFERENCES ekipa_otroci(id) ON DELETE CASCADE,
      prisoten BOOLEAN NOT NULL DEFAULT true,
      PRIMARY KEY (trening_id, otrok_id)
    );`;

  izvedeno = true;
}

export type EkipaOtrok = { id: number; ime: string; ekipa: string; aktiven: boolean };
export type EkipaTrening = {
  id: number;
  ekipa: string;
  datum: string;
  tip: string;
  voznja: string;
  discipline: string;
  pogoji: string;
  trenerji: string;
  st_prisotnih?: number;
};

// ---------- OTROCI ----------
export async function pridobiOtroke(ekipa: string) {
  const r = await sql<EkipaOtrok>`
    SELECT id, ime, ekipa, aktiven FROM ekipa_otroci
    WHERE ekipa = ${ekipa}
    ORDER BY aktiven DESC, ime;`;
  return r.rows;
}

export async function dodajOtroke(ekipa: string, imena: string[]) {
  for (const ime of imena) {
    const cisto = ime.trim();
    if (!cisto) continue;
    await sql`INSERT INTO ekipa_otroci (ime, ekipa) VALUES (${cisto}, ${ekipa});`;
  }
}

export async function posodobiOtroka(id: number, d: { ime?: string; aktiven?: boolean }) {
  if (d.ime !== undefined) await sql`UPDATE ekipa_otroci SET ime = ${d.ime.trim()} WHERE id = ${id};`;
  if (d.aktiven !== undefined) await sql`UPDATE ekipa_otroci SET aktiven = ${d.aktiven} WHERE id = ${id};`;
}

export async function izbrisiOtroka(id: number) {
  await sql`DELETE FROM ekipa_otroci WHERE id = ${id};`;
}

// ---------- TRENINGI ----------
export async function pridobiTreninge(ekipa: string) {
  const r = await sql<EkipaTrening>`
    SELECT t.id, t.ekipa, to_char(t.datum, 'YYYY-MM-DD') AS datum, t.tip, t.voznja, t.discipline,
           t.pogoji, t.trenerji,
           (SELECT COUNT(*)::int FROM ekipa_prisotnost p WHERE p.trening_id = t.id AND p.prisoten) AS st_prisotnih
    FROM ekipa_treningi t
    WHERE t.ekipa = ${ekipa}
    ORDER BY t.datum DESC;`;
  return r.rows;
}

// Odpre dan (če še ne obstaja, ga ustvari) in vrne trening + prisotnost
export async function odpriDan(ekipa: string, datum: string, trener: string) {
  await sql`
    INSERT INTO ekipa_treningi (ekipa, datum, trenerji)
    VALUES (${ekipa}, ${datum}, ${trener})
    ON CONFLICT (ekipa, datum) DO NOTHING;`;
  return pridobiDan(ekipa, datum);
}

export async function pridobiDan(ekipa: string, datum: string) {
  const t = await sql<EkipaTrening>`
    SELECT id, ekipa, to_char(datum, 'YYYY-MM-DD') AS datum, tip, voznja, discipline, pogoji, trenerji
    FROM ekipa_treningi WHERE ekipa = ${ekipa} AND datum = ${datum};`;
  const trening = t.rows[0] || null;
  if (!trening) return { trening: null, prisotni: [] as number[] };
  const p = await sql<{ otrok_id: number }>`
    SELECT otrok_id FROM ekipa_prisotnost WHERE trening_id = ${trening.id} AND prisoten;`;
  return { trening, prisotni: p.rows.map((x) => x.otrok_id) };
}

export async function posodobiTrening(
  id: number,
  d: { tip?: string; voznja?: string; discipline?: string; pogoji?: string; trenerji?: string }
) {
  if (d.tip !== undefined) await sql`UPDATE ekipa_treningi SET tip = ${d.tip} WHERE id = ${id};`;
  if (d.voznja !== undefined) await sql`UPDATE ekipa_treningi SET voznja = ${d.voznja} WHERE id = ${id};`;
  if (d.discipline !== undefined) await sql`UPDATE ekipa_treningi SET discipline = ${d.discipline} WHERE id = ${id};`;
  if (d.pogoji !== undefined) await sql`UPDATE ekipa_treningi SET pogoji = ${d.pogoji} WHERE id = ${id};`;
  if (d.trenerji !== undefined) await sql`UPDATE ekipa_treningi SET trenerji = ${d.trenerji} WHERE id = ${id};`;
}

export async function izbrisiTrening(id: number) {
  await sql`DELETE FROM ekipa_treningi WHERE id = ${id};`;
}

export async function nastaviPrisotnostOtroka(trening_id: number, otrok_id: number, prisoten: boolean) {
  await sql`
    INSERT INTO ekipa_prisotnost (trening_id, otrok_id, prisoten)
    VALUES (${trening_id}, ${otrok_id}, ${prisoten})
    ON CONFLICT (trening_id, otrok_id) DO UPDATE SET prisoten = EXCLUDED.prisoten;`;
}

export async function nastaviVsePrisotne(trening_id: number, otrok_ids: number[], prisoten: boolean) {
  for (const id of otrok_ids) await nastaviPrisotnostOtroka(trening_id, id, prisoten);
}

// ---------- STATISTIKA ----------
// Za vsakega otroka: koliko dni je bil prisoten (skupaj, treningi, tekme, po disciplinah)
export async function statistika(ekipa: string) {
  const r = await sql<{
    otrok_id: number;
    ime: string;
    aktiven: boolean;
    prisoten_skupaj: number;
    treningi: number;
    tekme: number;
    vsl: number;
    sl: number;
    sg: number;
    freestyle: number;
    fraj: number;
    proga: number;
  }>`
    SELECT o.id AS otrok_id, o.ime, o.aktiven,
      COUNT(t.id)::int AS prisoten_skupaj,
      COUNT(t.id) FILTER (WHERE t.tip = 'trening')::int AS treningi,
      COUNT(t.id) FILTER (WHERE t.tip = 'tekma')::int AS tekme,
      COUNT(t.id) FILTER (WHERE ';' || t.discipline || ';' LIKE '%;VSL;%')::int AS vsl,
      COUNT(t.id) FILTER (WHERE ';' || t.discipline || ';' LIKE '%;SL;%')::int AS sl,
      COUNT(t.id) FILTER (WHERE ';' || t.discipline || ';' LIKE '%;SG;%')::int AS sg,
      COUNT(t.id) FILTER (WHERE ';' || t.discipline || ';' LIKE '%;Freestyle;%')::int AS freestyle,
      COUNT(t.id) FILTER (WHERE ';' || t.voznja || ';' LIKE '%;fraj;%')::int AS fraj,
      COUNT(t.id) FILTER (WHERE ';' || t.voznja || ';' LIKE '%;proga;%')::int AS proga
    FROM ekipa_otroci o
    LEFT JOIN ekipa_prisotnost p ON p.otrok_id = o.id AND p.prisoten
    LEFT JOIN ekipa_treningi t ON t.id = p.trening_id
    WHERE o.ekipa = ${ekipa}
    GROUP BY o.id, o.ime, o.aktiven
    ORDER BY o.aktiven DESC, prisoten_skupaj DESC, o.ime;`;
  const s = await sql<{ skupaj: number; treningi: number; tekme: number }>`
    SELECT COUNT(*)::int AS skupaj,
      COUNT(*) FILTER (WHERE tip = 'trening')::int AS treningi,
      COUNT(*) FILTER (WHERE tip = 'tekma')::int AS tekme
    FROM ekipa_treningi WHERE ekipa = ${ekipa};`;
  return { otroci: r.rows, dnevi: s.rows[0] };
}
