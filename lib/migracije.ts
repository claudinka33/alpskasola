// lib/migracije.ts — samodejno ustvarjanje novih tabel (brez ročnega SQL-a)
// Kliče se iz API route-ov; izvede se največ enkrat na zagon strežnika.

import { sql } from "@vercel/postgres";

let izvedeno = false;

export async function zagotoviTabele() {
  if (izvedeno) return;

  // Polja prijavnice — nastavljiva po programih
  await sql`
    CREATE TABLE IF NOT EXISTS form_polja (
      id SERIAL PRIMARY KEY,
      program_slug TEXT NOT NULL,
      kljuc TEXT NOT NULL,
      label TEXT NOT NULL,
      tip TEXT NOT NULL DEFAULT 'text',
      moznosti TEXT,
      obvezno BOOLEAN NOT NULL DEFAULT false,
      viden BOOLEAN NOT NULL DEFAULT true,
      vrstni_red INT NOT NULL DEFAULT 0,
      sistemsko BOOLEAN NOT NULL DEFAULT false,
      UNIQUE (program_slug, kljuc)
    );`;

  // Kontakti — baza staršev za obveščanje
  await sql`
    CREATE TABLE IF NOT EXISTS kontakti (
      id SERIAL PRIMARY KEY,
      ime TEXT,
      priimek TEXT,
      email TEXT NOT NULL UNIQUE,
      telefon TEXT,
      otrok TEXT,
      oznake TEXT NOT NULL DEFAULT '',
      narocen BOOLEAN NOT NULL DEFAULT true,
      vir TEXT,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  // Email kampanje — dnevnik množičnega pošiljanja
  await sql`
    CREATE TABLE IF NOT EXISTS kampanje (
      id SERIAL PRIMARY KEY,
      zadeva TEXT NOT NULL,
      naslov TEXT,
      vsebina TEXT NOT NULL,
      filter_opis TEXT,
      prejemniki_st INT NOT NULL DEFAULT 0,
      poslano_st INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'osnutek',
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  // Dodatna (nastavljiva) polja na prijavi
  await sql`ALTER TABLE prijave ADD COLUMN IF NOT EXISTS dodatno JSONB;`;

  izvedeno = true;
}

// Privzeta nastavljiva polja — se zasejejo za program ob prvem obisku nastavitev
export const PRIVZETA_POLJA = [
  { kljuc: "otrok_znanje", label: "Predznanje otroka", tip: "select", moznosti: "Začetnik, Osnovno znanje, Srednje znanje, Napredno, Tekmovalna raven", obvezno: false, viden: true, sistemsko: true },
  { kljuc: "naslov", label: "Naslov", tip: "text", moznosti: null, obvezno: false, viden: true, sistemsko: true },
  { kljuc: "posta", label: "Pošta in kraj", tip: "text", moznosti: null, obvezno: false, viden: true, sistemsko: true },
  { kljuc: "alergije", label: "Alergije", tip: "text", moznosti: null, obvezno: false, viden: false, sistemsko: true },
  { kljuc: "opomba", label: "Opomba", tip: "textarea", moznosti: null, obvezno: false, viden: true, sistemsko: true },
];

export async function zagotoviPoljaZaProgram(program_slug: string) {
  const obstojeca = await sql`SELECT COUNT(*)::int AS c FROM form_polja WHERE program_slug = ${program_slug};`;
  if (obstojeca.rows[0].c > 0) return;
  let i = 0;
  for (const p of PRIVZETA_POLJA) {
    await sql`
      INSERT INTO form_polja (program_slug, kljuc, label, tip, moznosti, obvezno, viden, vrstni_red, sistemsko)
      VALUES (${program_slug}, ${p.kljuc}, ${p.label}, ${p.tip}, ${p.moznosti}, ${p.obvezno}, ${p.viden}, ${i++}, ${p.sistemsko})
      ON CONFLICT (program_slug, kljuc) DO NOTHING;`;
  }
}
