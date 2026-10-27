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

  await sql`ALTER TABLE ekipa_otroci ADD COLUMN IF NOT EXISTS letnik INT;`;
  await sql`ALTER TABLE ekipa_otroci ADD COLUMN IF NOT EXISTS skupina TEXT NOT NULL DEFAULT '';`;

  // Isti otrok (ime) v isti ekipi samo enkrat
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS ekipa_otroci_ime ON ekipa_otroci (ekipa, lower(ime));`;

  // Začetni seznam ekipe U10/U12 — vpiše se samo ENKRAT v življenju baze
  // (zastavica v ekipa_nastavitve; tudi če kasneje otroke izbrišeš, se ne vrnejo).
  await sql`CREATE TABLE IF NOT EXISTS ekipa_nastavitve (kljuc TEXT PRIMARY KEY, ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now());`;
  await sql`ALTER TABLE ekipa_nastavitve ADD COLUMN IF NOT EXISTS vrednost TEXT;`;
  const prvic = await sql`
    INSERT INTO ekipa_nastavitve (kljuc) VALUES ('zacetni_u10_u12')
    ON CONFLICT (kljuc) DO NOTHING RETURNING kljuc;`;
  if (prvic.rows.length > 0) {
    for (const [ime, letnik, skupina] of ZACETNI_U10_U12) {
      await sql`
        INSERT INTO ekipa_otroci (ime, ekipa, letnik, skupina)
        VALUES (${ime}, 'U10/U12', ${letnik}, ${skupina})
        ON CONFLICT (ekipa, lower(ime)) DO UPDATE SET letnik = EXCLUDED.letnik, skupina = EXCLUDED.skupina;`;
    }
  }

  izvedeno = true;
}

const ZACETNI_U10_U12: [string, number, string][] = [
  ["Vita Sladič", 2017, "U10"],
  ["Štefan Jamšek", 2018, "U10"],
  ["Marko Podbukovšek", 2018, "U10"],
  ["Živa Ribič", 2016, "U12 deklice"],
  ["Tesa Komplet", 2016, "U12 deklice"],
  ["Julija Krajnc", 2016, "U12 deklice"],
  ["Kiara Toretto", 2015, "U12 deklice"],
  ["Eva Kus Ambrož", 2015, "U12 deklice"],
  ["Una Arzenšek", 2015, "U12 deklice"],
  ["Luka Gorečan-Fijavž", 2016, "U12 dečki"],
  ["Jošt Steinacher", 2016, "U12 dečki"],
  ["Aleks Hren", 2016, "U12 dečki"],
  ["Jaka Oberč", 2016, "U12 dečki"],
  ["Tim Cilenšek", 2015, "U12 dečki"],
];

export type EkipaOtrok = {
  id: number;
  ime: string;
  ekipa: string;
  aktiven: boolean;
  letnik: number | null;
  skupina: string;
};
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
    SELECT id, ime, ekipa, aktiven, letnik, skupina FROM ekipa_otroci
    WHERE ekipa = ${ekipa}
    ORDER BY aktiven DESC, skupina, ime;`;
  return r.rows;
}

export async function dodajOtroka(ekipa: string, d: { ime: string; letnik?: number | null; skupina?: string }) {
  const ime = (d.ime || "").trim();
  if (!ime) return;
  const r = await sql`
    INSERT INTO ekipa_otroci (ime, ekipa, letnik, skupina)
    VALUES (${ime}, ${ekipa}, ${d.letnik || null}, ${(d.skupina || "").trim()})
    ON CONFLICT (ekipa, lower(ime)) DO NOTHING RETURNING id;`;
  if (r.rows.length === 0) throw new Error(`${ime} je že v ekipi.`);
}

export async function posodobiOtroka(
  id: number,
  d: { ime?: string; aktiven?: boolean; letnik?: number | null; skupina?: string }
) {
  if (d.ime !== undefined) await sql`UPDATE ekipa_otroci SET ime = ${d.ime.trim()} WHERE id = ${id};`;
  if (d.aktiven !== undefined) await sql`UPDATE ekipa_otroci SET aktiven = ${d.aktiven} WHERE id = ${id};`;
  if (d.letnik !== undefined) await sql`UPDATE ekipa_otroci SET letnik = ${d.letnik || null} WHERE id = ${id};`;
  if (d.skupina !== undefined) await sql`UPDATE ekipa_otroci SET skupina = ${d.skupina.trim()} WHERE id = ${id};`;
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

// Shrani cel dan naenkrat (gumb »Shrani«): ustvari dan, če ga še ni, zapiše izbire
// in prisotnost (kdor ni na seznamu prisotnih, je odsoten).
export async function shraniDan(
  ekipa: string,
  datum: string,
  p: { tip: string; voznja: string; discipline: string; pogoji: string; trenerji: string },
  prisotni: number[]
) {
  const r = await sql<{ id: number }>`
    INSERT INTO ekipa_treningi (ekipa, datum, tip, voznja, discipline, pogoji, trenerji)
    VALUES (${ekipa}, ${datum}, ${p.tip || "trening"}, ${p.voznja || ""}, ${p.discipline || ""}, ${p.pogoji || ""}, ${p.trenerji || ""})
    ON CONFLICT (ekipa, datum) DO UPDATE SET
      tip = EXCLUDED.tip, voznja = EXCLUDED.voznja, discipline = EXCLUDED.discipline,
      pogoji = EXCLUDED.pogoji, trenerji = EXCLUDED.trenerji
    RETURNING id;`;
  const id = r.rows[0].id;
  await sql`DELETE FROM ekipa_prisotnost WHERE trening_id = ${id};`;
  for (const otrok_id of prisotni) {
    await sql`
      INSERT INTO ekipa_prisotnost (trening_id, otrok_id, prisoten) VALUES (${id}, ${otrok_id}, true)
      ON CONFLICT (trening_id, otrok_id) DO UPDATE SET prisoten = true;`;
  }
  return id;
}

// ---------- MOŽNOSTI (ekipe, trenerji, discipline …) ----------
// Shranjene kot JSON; če jih še ni, stran uporabi privzete.
export async function pridobiMoznosti() {
  const r = await sql<{ vrednost: string | null }>`SELECT vrednost FROM ekipa_nastavitve WHERE kljuc = 'moznosti';`;
  try {
    return r.rows[0]?.vrednost ? JSON.parse(r.rows[0].vrednost) : null;
  } catch {
    return null;
  }
}

export async function shraniMoznosti(m: unknown) {
  const json = JSON.stringify(m);
  await sql`
    INSERT INTO ekipa_nastavitve (kljuc, vrednost) VALUES ('moznosti', ${json})
    ON CONFLICT (kljuc) DO UPDATE SET vrednost = EXCLUDED.vrednost;`;
}

// ---------- STATISTIKA ----------
// Vrne surove podatke; seštevke po disciplinah ipd. naredi stran (ker se možnosti lahko spreminjajo).
export async function statistika(ekipa: string) {
  const otroci = await sql<{ id: number; ime: string; aktiven: boolean; skupina: string; letnik: number | null }>`
    SELECT id, ime, aktiven, skupina, letnik FROM ekipa_otroci WHERE ekipa = ${ekipa};`;
  const treningi = await sql<{ id: number; datum: string; tip: string; voznja: string; discipline: string; pogoji: string }>`
    SELECT id, to_char(datum, 'YYYY-MM-DD') AS datum, tip, voznja, discipline, pogoji
    FROM ekipa_treningi WHERE ekipa = ${ekipa};`;
  const prisotnost = await sql<{ trening_id: number; otrok_id: number }>`
    SELECT p.trening_id, p.otrok_id FROM ekipa_prisotnost p
    JOIN ekipa_treningi t ON t.id = p.trening_id
    WHERE t.ekipa = ${ekipa} AND p.prisoten;`;
  return { otroci: otroci.rows, treningi: treningi.rows, prisotnost: prisotnost.rows };
}
