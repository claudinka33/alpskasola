// lib/vsebina.ts — vsebina programov, ki jo urejaš iz CMS-a (cenik + termini na javni strani)
// Tabele se ustvarijo same ob prvem klicu — ročnega SQL-a ni treba.

import { sql } from "@vercel/postgres";

let izvedeno = false;

export async function zagotoviVsebino() {
  if (izvedeno) return;

  // Termini — dodatna polja za prikaz na javni strani programa
  await sql`ALTER TABLE termini ADD COLUMN IF NOT EXISTS dan TEXT;`;
  await sql`ALTER TABLE termini ADD COLUMN IF NOT EXISTS ura TEXT;`;
  await sql`ALTER TABLE termini ADD COLUMN IF NOT EXISTS skupina TEXT;`;
  await sql`ALTER TABLE termini ADD COLUMN IF NOT EXISTS na_strani BOOLEAN NOT NULL DEFAULT true;`;

  // Cenik — kartice s cenami po programih
  await sql`
    CREATE TABLE IF NOT EXISTS cenik (
      id SERIAL PRIMARY KEY,
      program_slug TEXT NOT NULL,
      naziv TEXT NOT NULL,
      podnaslov TEXT,
      cena TEXT NOT NULL,
      enota TEXT,
      opomba TEXT,
      vkljuceno TEXT,
      poudarjen BOOLEAN NOT NULL DEFAULT false,
      aktiven BOOLEAN NOT NULL DEFAULT true,
      vrstni_red INT NOT NULL DEFAULT 0,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  izvedeno = true;
}

// ---------- TIPI ----------

export type CenikPostavka = {
  id: number;
  program_slug: string;
  naziv: string;
  podnaslov: string | null;
  cena: string;
  enota: string | null;
  opomba: string | null;
  vkljuceno: string | null; // ena vrstica = ena kljukica
  poudarjen: boolean;
  aktiven: boolean;
  vrstni_red: number;
  ustvarjeno: string;
};

export type TerminNaStrani = {
  id: number;
  program_slug: string;
  naziv: string;
  lokacija: string | null;
  dan: string | null;
  ura: string | null;
  skupina: string | null;
  status: string;
  vrstni_red: number;
};

// ---------- BRANJE ZA JAVNO STRAN ----------

export async function pridobiTerminiZaStran(program_slug: string) {
  await zagotoviVsebino();
  const r = await sql<TerminNaStrani>`
    SELECT id, program_slug, naziv, lokacija, dan, ura, skupina, status, vrstni_red
    FROM termini
    WHERE program_slug = ${program_slug}
      AND aktiven = true
      AND na_strani = true
    ORDER BY vrstni_red, id;`;
  return r.rows;
}

export async function pridobiCenikZaStran(program_slug: string) {
  await zagotoviVsebino();
  const r = await sql<CenikPostavka>`
    SELECT * FROM cenik
    WHERE program_slug = ${program_slug} AND aktiven = true
    ORDER BY vrstni_red, id;`;
  return r.rows;
}

// ---------- CRUD ZA CMS ----------

export async function pridobiCenik(program_slug?: string) {
  await zagotoviVsebino();
  if (program_slug) {
    const r = await sql<CenikPostavka>`SELECT * FROM cenik WHERE program_slug = ${program_slug} ORDER BY vrstni_red, id;`;
    return r.rows;
  }
  const r = await sql<CenikPostavka>`SELECT * FROM cenik ORDER BY program_slug, vrstni_red, id;`;
  return r.rows;
}

export async function ustvariCenik(d: Partial<CenikPostavka>) {
  await zagotoviVsebino();
  const r = await sql<CenikPostavka>`
    INSERT INTO cenik (program_slug, naziv, podnaslov, cena, enota, opomba, vkljuceno, poudarjen, aktiven, vrstni_red)
    VALUES (${d.program_slug!}, ${d.naziv!}, ${d.podnaslov || null}, ${d.cena!}, ${d.enota || null},
            ${d.opomba || null}, ${d.vkljuceno || null}, ${d.poudarjen ?? false}, ${d.aktiven ?? true}, ${d.vrstni_red ?? 0})
    RETURNING *;`;
  return r.rows[0];
}

export async function posodobiCenik(id: number, d: Partial<CenikPostavka>) {
  await zagotoviVsebino();
  await sql`UPDATE cenik SET
    program_slug = ${d.program_slug!},
    naziv = ${d.naziv!},
    podnaslov = ${d.podnaslov || null},
    cena = ${d.cena!},
    enota = ${d.enota || null},
    opomba = ${d.opomba || null},
    vkljuceno = ${d.vkljuceno || null},
    poudarjen = ${d.poudarjen ?? false},
    aktiven = ${d.aktiven ?? true},
    vrstni_red = ${d.vrstni_red ?? 0}
    WHERE id = ${id};`;
}

export async function nastaviCenikAktiven(id: number, aktiven: boolean) {
  await zagotoviVsebino();
  await sql`UPDATE cenik SET aktiven = ${aktiven} WHERE id = ${id};`;
}

export async function izbrisiCenik(id: number) {
  await zagotoviVsebino();
  await sql`DELETE FROM cenik WHERE id = ${id};`;
}
