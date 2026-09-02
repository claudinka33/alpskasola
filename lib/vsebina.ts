// lib/vsebina.ts — vsebina programov, ki jo urejaš iz CMS-a (cenik + termini na javni strani)
// Tabele in stolpci se ustvarijo sami ob prvem klicu — ročnega SQL-a ni treba.

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

  // Barva kartice in besedilo značke (npr. "NAJBOLJ POPULAREN")
  await sql`ALTER TABLE cenik ADD COLUMN IF NOT EXISTS barva TEXT;`;
  await sql`ALTER TABLE cenik ADD COLUMN IF NOT EXISTS znacka TEXT;`;

  // Glava sekcije cenika (naslov nad karticami + rumena opomba pod njimi)
  await sql`
    CREATE TABLE IF NOT EXISTS cenik_sekcija (
      program_slug TEXT PRIMARY KEY,
      badge TEXT,
      naslov TEXT,
      podnaslov TEXT,
      opomba_spodaj TEXT,
      posodobljeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  // Evidenca enkratnih uvozov obstoječe vsebine
  await sql`
    CREATE TABLE IF NOT EXISTS vsebina_seed (
      kljuc TEXT PRIMARY KEY,
      izvedeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  izvedeno = true;

  try {
    await uvoziSmucanje();
  } catch (e) {
    console.error("uvoziSmucanje:", e);
  }
}

// Enkratni uvoz treh paketov, ki so bili prej zapisani v kodi strani /sola-smucanja.
// Zažene se natanko enkrat — če postavke pozneje izbrišeš, se ne vrnejo.
async function uvoziSmucanje() {
  const KLJUC = "sola-smucanja-v1";
  const ze = await sql`SELECT 1 FROM vsebina_seed WHERE kljuc = ${KLJUC};`;
  if (ze.rows.length > 0) return;

  await sql`
    INSERT INTO cenik_sekcija (program_slug, badge, naslov, podnaslov, opomba_spodaj)
    VALUES ('sola-smucanja', 'Cenik', 'Izberite svoj paket',
            'Tri možnosti, prilagojene starosti in panogi.',
            '**Dnevna smučarska karta** na voljo po akcijski ceni **27,50€** (ni všteto v paketu).')
    ON CONFLICT (program_slug) DO NOTHING;`;

  await sql`
    INSERT INTO cenik (program_slug, naziv, podnaslov, cena, barva, znacka, poudarjen, vrstni_red, vkljuceno)
    VALUES
      ('sola-smucanja', 'MINI ŠOLA SMUČANJA', 'Paket 6 sobot + zaključna prireditev', '350€', 'vijolicna', NULL, false, 0,
       'Paket 6 sobot + zaključna prireditev
Starost 4 – 6 let
Pričnemo 10.1.2026
Medalja in FIS brošura
Smučamo soboto 9.30 – 13.00'),
      ('sola-smucanja', 'ŠOLA SMUČANJA', 'Paket 8 sobot', '480€', 'oranzna', '⭐ NAJBOLJ POPULAREN', true, 1,
       '8x tečaj od 9h – 15h
8x organiziran prevoz iz Celja
Kosilo s čajem v hotelu Planja
Medalja + FIS brošura
Začnemo 10.1.2026
Cena karte 27,50€ (ni v paketu)'),
      ('sola-smucanja', 'ŠOLA BORDANJA', 'Paket 8 sobot', '480€', 'modra', NULL, false, 2,
       '8x tečaj od 9h – 15h
8x organiziran prevoz iz Celja
Kosilo s čajem v hotelu Planja
Medalja + FIS brošura
Začnemo 10.1.2026
Cena karte 27,50€ (ni v paketu)');`;

  await sql`INSERT INTO vsebina_seed (kljuc) VALUES (${KLJUC}) ON CONFLICT DO NOTHING;`;
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
  barva: string | null;
  znacka: string | null;
  poudarjen: boolean;
  aktiven: boolean;
  vrstni_red: number;
  ustvarjeno: string;
};

export type CenikSekcijaGlava = {
  program_slug: string;
  badge: string | null;
  naslov: string | null;
  podnaslov: string | null;
  opomba_spodaj: string | null;
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

export async function pridobiCenikSekcijo(
  program_slug: string
): Promise<CenikSekcijaGlava | null> {
  await zagotoviVsebino();
  const r = await sql<CenikSekcijaGlava>`
    SELECT program_slug, badge, naslov, podnaslov, opomba_spodaj
    FROM cenik_sekcija WHERE program_slug = ${program_slug};`;
  return r.rows[0] || null;
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
    INSERT INTO cenik (program_slug, naziv, podnaslov, cena, enota, opomba, vkljuceno, barva, znacka, poudarjen, aktiven, vrstni_red)
    VALUES (${d.program_slug!}, ${d.naziv!}, ${d.podnaslov || null}, ${d.cena!}, ${d.enota || null},
            ${d.opomba || null}, ${d.vkljuceno || null}, ${d.barva || null}, ${d.znacka || null},
            ${d.poudarjen ?? false}, ${d.aktiven ?? true}, ${d.vrstni_red ?? 0})
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
    barva = ${d.barva || null},
    znacka = ${d.znacka || null},
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

export async function shraniCenikSekcijo(d: CenikSekcijaGlava) {
  await zagotoviVsebino();
  await sql`
    INSERT INTO cenik_sekcija (program_slug, badge, naslov, podnaslov, opomba_spodaj, posodobljeno)
    VALUES (${d.program_slug}, ${d.badge || null}, ${d.naslov || null}, ${d.podnaslov || null}, ${d.opomba_spodaj || null}, now())
    ON CONFLICT (program_slug) DO UPDATE SET
      badge = EXCLUDED.badge,
      naslov = EXCLUDED.naslov,
      podnaslov = EXCLUDED.podnaslov,
      opomba_spodaj = EXCLUDED.opomba_spodaj,
      posodobljeno = now();`;
}
