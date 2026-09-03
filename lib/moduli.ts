// lib/moduli.ts — prisotnost, plačila, učitelji, oznake terminov in email predloge.
// Tabele in stolpci se ustvarijo sami ob prvem klicu — ročnega SQL-a ni treba.

import { sql } from "@vercel/postgres";

let izvedeno = false;

export async function zagotoviModule() {
  if (izvedeno) return;

  // Oznaka termina za ciljano pošiljanje emailov
  await sql`ALTER TABLE termini ADD COLUMN IF NOT EXISTS oznaka TEXT;`;

  // Povezava prijave na konkreten termin + oznaka, ki jo je prijava dobila
  await sql`ALTER TABLE prijave ADD COLUMN IF NOT EXISTS termin_id INT;`;
  await sql`ALTER TABLE prijave ADD COLUMN IF NOT EXISTS oznaka TEXT;`;

  // Učitelji — seznam se dopolnjuje sproti, ko Zoja vpiše novo ime
  await sql`
    CREATE TABLE IF NOT EXISTS ucitelji (
      id SERIAL PRIMARY KEY,
      ime TEXT NOT NULL UNIQUE,
      aktiven BOOLEAN NOT NULL DEFAULT true,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;

  // Srečanja — ena vadba enega termina na določen datum
  await sql`
    CREATE TABLE IF NOT EXISTS srecanja (
      id SERIAL PRIMARY KEY,
      program_slug TEXT NOT NULL,
      termin_id INT NOT NULL,
      datum DATE NOT NULL,
      ucitelji TEXT NOT NULL DEFAULT '',
      trajanje_min INT NOT NULL DEFAULT 60,
      opomba TEXT,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (termin_id, datum)
    );`;

  // Prisotnost — ena vrstica na otroka na srečanje
  await sql`
    CREATE TABLE IF NOT EXISTS prisotnost (
      id SERIAL PRIMARY KEY,
      srecanje_id INT NOT NULL REFERENCES srecanja(id) ON DELETE CASCADE,
      prijava_id INT NOT NULL,
      prisoten BOOLEAN NOT NULL DEFAULT false,
      gost BOOLEAN NOT NULL DEFAULT false,
      opomba TEXT,
      UNIQUE (srecanje_id, prijava_id)
    );`;

  // Plačila — ena vrstica na otroka na mesec (npr. '2026-10')
  await sql`
    CREATE TABLE IF NOT EXISTS placila (
      id SERIAL PRIMARY KEY,
      prijava_id INT NOT NULL,
      mesec TEXT NOT NULL,
      placano BOOLEAN NOT NULL DEFAULT false,
      znesek NUMERIC(10,2),
      datum DATE,
      opomba TEXT,
      posodobljeno TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (prijava_id, mesec)
    );`;

  // Nastavitve plačil po programu — obdobje in privzeti mesečni znesek
  await sql`
    CREATE TABLE IF NOT EXISTS placila_nastavitve (
      program_slug TEXT PRIMARY KEY,
      mesec_od TEXT NOT NULL DEFAULT '2026-10',
      mesec_do TEXT NOT NULL DEFAULT '2027-05',
      privzeti_znesek NUMERIC(10,2)
    );`;

  // Blok-zapis kampanje, da jo je mogoče kasneje podvojiti in urejati
  await sql`ALTER TABLE kampanje ADD COLUMN IF NOT EXISTS bloki TEXT;`;

  // Shranjene predloge emailov
  await sql`
    CREATE TABLE IF NOT EXISTS email_predloge (
      id SERIAL PRIMARY KEY,
      naziv TEXT NOT NULL,
      zadeva TEXT NOT NULL DEFAULT '',
      naslov TEXT,
      vsebina TEXT NOT NULL DEFAULT '',
      bloki TEXT,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;
  await sql`ALTER TABLE email_predloge ADD COLUMN IF NOT EXISTS bloki TEXT;`;

  izvedeno = true;
}

// ---------- TIPI ----------

export type Ucitelj = { id: number; ime: string; aktiven: boolean };

export type Srecanje = {
  id: number;
  program_slug: string;
  termin_id: number;
  datum: string;
  ucitelji: string;
  trajanje_min: number;
  opomba: string | null;
};

export type PrisotnostVrstica = {
  id: number | null;
  prijava_id: number;
  otrok_ime: string;
  otrok_priimek: string;
  prisoten: boolean;
  gost: boolean;
  opomba: string | null;
  maticni_termin_id: number | null;
};

export type Placilo = {
  id: number;
  prijava_id: number;
  mesec: string;
  placano: boolean;
  znesek: string | null;
  datum: string | null;
  opomba: string | null;
};

export type EmailPredloga = {
  id: number;
  naziv: string;
  zadeva: string;
  naslov: string | null;
  vsebina: string;
  bloki: string | null;
  ustvarjeno: string;
};

// ---------- UČITELJI ----------

export async function pridobiUcitelje() {
  await zagotoviModule();
  const r = await sql<Ucitelj>`SELECT id, ime, aktiven FROM ucitelji ORDER BY ime;`;
  return r.rows;
}

export async function dodajUcitelja(ime: string) {
  await zagotoviModule();
  const cist = ime.trim();
  if (!cist) return null;
  const r = await sql<Ucitelj>`
    INSERT INTO ucitelji (ime) VALUES (${cist})
    ON CONFLICT (ime) DO UPDATE SET aktiven = true
    RETURNING id, ime, aktiven;`;
  return r.rows[0];
}

export async function izbrisiUcitelja(id: number) {
  await zagotoviModule();
  await sql`DELETE FROM ucitelji WHERE id = ${id};`;
}

// ---------- SREČANJA IN PRISOTNOST ----------

export async function pridobiSrecanja(termin_id: number) {
  await zagotoviModule();
  const r = await sql<Srecanje>`
    SELECT * FROM srecanja WHERE termin_id = ${termin_id} ORDER BY datum DESC;`;
  return r.rows;
}

// Odpre (ali najde) srečanje in poskrbi, da ima vrstico vsak prijavljen otrok.
export async function odpriSrecanje(program_slug: string, termin_id: number, datum: string) {
  await zagotoviModule();
  const obstoj = await sql<Srecanje>`
    SELECT * FROM srecanja WHERE termin_id = ${termin_id} AND datum = ${datum};`;
  let srecanje = obstoj.rows[0];
  if (!srecanje) {
    const nov = await sql<Srecanje>`
      INSERT INTO srecanja (program_slug, termin_id, datum)
      VALUES (${program_slug}, ${termin_id}, ${datum})
      RETURNING *;`;
    srecanje = nov.rows[0];
  }
  // Vsak otrok, ki je prijavljen na ta termin, dobi vrstico (privzeto odsoten).
  await sql`
    INSERT INTO prisotnost (srecanje_id, prijava_id, prisoten, gost)
    SELECT ${srecanje.id}, p.id, false, false
    FROM prijave p
    WHERE p.termin_id = ${termin_id}
    ON CONFLICT (srecanje_id, prijava_id) DO NOTHING;`;
  return srecanje;
}

export async function pridobiPrisotnost(srecanje_id: number) {
  await zagotoviModule();
  const r = await sql<PrisotnostVrstica>`
    SELECT pr.id, pr.prijava_id, p.otrok_ime, p.otrok_priimek,
           pr.prisoten, pr.gost, pr.opomba, p.termin_id AS maticni_termin_id
    FROM prisotnost pr
    JOIN prijave p ON p.id = pr.prijava_id
    WHERE pr.srecanje_id = ${srecanje_id}
    ORDER BY p.otrok_priimek, p.otrok_ime;`;
  return r.rows;
}

export async function nastaviPrisotnost(srecanje_id: number, prijava_id: number, prisoten: boolean) {
  await zagotoviModule();
  await sql`
    INSERT INTO prisotnost (srecanje_id, prijava_id, prisoten)
    VALUES (${srecanje_id}, ${prijava_id}, ${prisoten})
    ON CONFLICT (srecanje_id, prijava_id) DO UPDATE SET prisoten = EXCLUDED.prisoten;`;
}

export async function posodobiSrecanje(id: number, d: { ucitelji?: string; trajanje_min?: number; opomba?: string | null }) {
  await zagotoviModule();
  await sql`
    UPDATE srecanja SET
      ucitelji = ${d.ucitelji ?? ""},
      trajanje_min = ${d.trajanje_min ?? 60},
      opomba = ${d.opomba || null}
    WHERE id = ${id};`;
}

export async function izbrisiSrecanje(id: number) {
  await zagotoviModule();
  await sql`DELETE FROM srecanja WHERE id = ${id};`;
}

// Otrok pride enkratno na drugo uro — dodaj ga na to srečanje kot gosta.
export async function dodajGosta(srecanje_id: number, prijava_id: number) {
  await zagotoviModule();
  await sql`
    INSERT INTO prisotnost (srecanje_id, prijava_id, prisoten, gost)
    VALUES (${srecanje_id}, ${prijava_id}, true, true)
    ON CONFLICT (srecanje_id, prijava_id) DO UPDATE SET gost = true, prisoten = true;`;
}

export async function odstraniIzSrecanja(srecanje_id: number, prijava_id: number) {
  await zagotoviModule();
  await sql`DELETE FROM prisotnost WHERE srecanje_id = ${srecanje_id} AND prijava_id = ${prijava_id};`;
}

// Trajni premik otroka v drug termin (posodobi tudi besedilo in oznako).
export async function premakniOtroka(prijava_id: number, nov_termin_id: number) {
  await zagotoviModule();
  const t = await sql`SELECT naziv, oznaka FROM termini WHERE id = ${nov_termin_id};`;
  const naziv = t.rows[0]?.naziv || null;
  const oznaka = t.rows[0]?.oznaka || null;
  await sql`
    UPDATE prijave SET termin_id = ${nov_termin_id}, termin = ${naziv}, oznaka = ${oznaka}
    WHERE id = ${prijava_id};`;
}

// Povzetek prisotnosti po otroku za en termin
export async function povzetekPrisotnosti(termin_id: number) {
  await zagotoviModule();
  const r = await sql<{
    prijava_id: number;
    otrok_ime: string;
    otrok_priimek: string;
    skupaj: number;
    prisoten: number;
  }>`
    SELECT p.id AS prijava_id, p.otrok_ime, p.otrok_priimek,
           COUNT(pr.id)::int AS skupaj,
           COUNT(pr.id) FILTER (WHERE pr.prisoten)::int AS prisoten
    FROM prijave p
    LEFT JOIN prisotnost pr ON pr.prijava_id = p.id
    LEFT JOIN srecanja s ON s.id = pr.srecanje_id AND s.termin_id = ${termin_id}
    WHERE p.termin_id = ${termin_id}
    GROUP BY p.id, p.otrok_ime, p.otrok_priimek
    ORDER BY p.otrok_priimek, p.otrok_ime;`;
  return r.rows;
}

// Ure po učiteljih — za obračun
export async function ureUciteljev(program_slug?: string, od?: string, do_?: string) {
  await zagotoviModule();
  const r = await sql<{ ucitelji: string; trajanje_min: number; datum: string; program_slug: string }>`
    SELECT ucitelji, trajanje_min, datum, program_slug FROM srecanja
    WHERE (${program_slug || null}::text IS NULL OR program_slug = ${program_slug || null})
      AND (${od || null}::date IS NULL OR datum >= ${od || null}::date)
      AND (${do_ || null}::date IS NULL OR datum <= ${do_ || null}::date)
    ORDER BY datum;`;
  const skupno: Record<string, { srecanj: number; minut: number }> = {};
  for (const s of r.rows) {
    for (const ime of (s.ucitelji || "").split(";").map((x) => x.trim()).filter(Boolean)) {
      if (!skupno[ime]) skupno[ime] = { srecanj: 0, minut: 0 };
      skupno[ime].srecanj += 1;
      skupno[ime].minut += s.trajanje_min || 0;
    }
  }
  return Object.entries(skupno)
    .map(([ime, v]) => ({ ime, srecanj: v.srecanj, minut: v.minut, ure: +(v.minut / 60).toFixed(2) }))
    .sort((a, b) => b.minut - a.minut);
}

// ---------- PLAČILA ----------

export async function pridobiNastavitvePlacil(program_slug: string) {
  await zagotoviModule();
  const r = await sql<{ program_slug: string; mesec_od: string; mesec_do: string; privzeti_znesek: string | null }>`
    SELECT * FROM placila_nastavitve WHERE program_slug = ${program_slug};`;
  return r.rows[0] || null;
}

export async function shraniNastavitvePlacil(d: {
  program_slug: string;
  mesec_od: string;
  mesec_do: string;
  privzeti_znesek: number | null;
}) {
  await zagotoviModule();
  await sql`
    INSERT INTO placila_nastavitve (program_slug, mesec_od, mesec_do, privzeti_znesek)
    VALUES (${d.program_slug}, ${d.mesec_od}, ${d.mesec_do}, ${d.privzeti_znesek})
    ON CONFLICT (program_slug) DO UPDATE SET
      mesec_od = EXCLUDED.mesec_od,
      mesec_do = EXCLUDED.mesec_do,
      privzeti_znesek = EXCLUDED.privzeti_znesek;`;
}

export async function pridobiPlacila(program_slug: string, termin_id?: number) {
  await zagotoviModule();
  const r = await sql<Placilo & { otrok_ime: string; otrok_priimek: string; termin_id: number | null }>`
    SELECT pl.*, p.otrok_ime, p.otrok_priimek, p.termin_id
    FROM prijave p
    LEFT JOIN placila pl ON pl.prijava_id = p.id
    WHERE p.program = ${program_slug}
      AND (${termin_id ?? null}::int IS NULL OR p.termin_id = ${termin_id ?? null})
    ORDER BY p.otrok_priimek, p.otrok_ime;`;
  return r.rows;
}

export async function nastaviPlacilo(d: {
  prijava_id: number;
  mesec: string;
  placano: boolean;
  znesek: number | null;
  datum: string | null;
  opomba: string | null;
}) {
  await zagotoviModule();
  await sql`
    INSERT INTO placila (prijava_id, mesec, placano, znesek, datum, opomba, posodobljeno)
    VALUES (${d.prijava_id}, ${d.mesec}, ${d.placano}, ${d.znesek}, ${d.datum}, ${d.opomba}, now())
    ON CONFLICT (prijava_id, mesec) DO UPDATE SET
      placano = EXCLUDED.placano,
      znesek = EXCLUDED.znesek,
      datum = EXCLUDED.datum,
      opomba = EXCLUDED.opomba,
      posodobljeno = now();`;
}

// ---------- EMAIL PREDLOGE ----------

export async function pridobiPredloge() {
  await zagotoviModule();
  const r = await sql<EmailPredloga>`SELECT * FROM email_predloge ORDER BY ustvarjeno DESC;`;
  return r.rows;
}

export async function shraniPredlogo(d: {
  id?: number;
  naziv: string;
  zadeva: string;
  naslov: string | null;
  vsebina: string;
  bloki: string | null;
}) {
  await zagotoviModule();
  if (d.id) {
    await sql`
      UPDATE email_predloge SET naziv = ${d.naziv}, zadeva = ${d.zadeva},
        naslov = ${d.naslov}, vsebina = ${d.vsebina}, bloki = ${d.bloki} WHERE id = ${d.id};`;
    return d.id;
  }
  const r = await sql<{ id: number }>`
    INSERT INTO email_predloge (naziv, zadeva, naslov, vsebina, bloki)
    VALUES (${d.naziv}, ${d.zadeva}, ${d.naslov}, ${d.vsebina}, ${d.bloki}) RETURNING id;`;
  return r.rows[0].id;
}

export async function izbrisiPredlogo(id: number) {
  await zagotoviModule();
  await sql`DELETE FROM email_predloge WHERE id = ${id};`;
}

// ---------- OZNAKE IZ TERMINOV ----------

// Ob prijavi vrne oznake, ki jih dobi starš: program + oznaka termina.
export async function oznakeZaPrijavo(program_slug: string, termin_id?: number | null) {
  await zagotoviModule();
  const oznake = [program_slug];
  if (termin_id) {
    const r = await sql<{ oznaka: string | null }>`SELECT oznaka FROM termini WHERE id = ${termin_id};`;
    const o = r.rows[0]?.oznaka?.trim();
    if (o) oznake.push(o);
  }
  return oznake.join(";");
}

// Enkraten popravek za nazaj: prijavam brez termin_id poišče termin po besedilu
// in kontaktom dopiše manjkajočo oznako termina.
export async function popraviOznakeZaNazaj(program_slug: string) {
  await zagotoviModule();

  // 1) Poveži prijave s termini po nazivu (prijava.termin vsebuje naziv termina).
  await sql`
    UPDATE prijave p SET termin_id = t.id
    FROM termini t
    WHERE p.termin_id IS NULL
      AND p.program = ${program_slug}
      AND t.program_slug = ${program_slug}
      AND p.termin IS NOT NULL
      AND (p.termin = t.naziv OR p.termin LIKE t.naziv || ' (%');`;

  // 2) Zapiši oznako na prijavo.
  await sql`
    UPDATE prijave p SET oznaka = t.oznaka
    FROM termini t
    WHERE p.termin_id = t.id AND t.oznaka IS NOT NULL AND t.oznaka <> ''
      AND p.program = ${program_slug};`;

  // 3) Dopiši oznako kontaktu (brez podvajanja).
  const r = await sql<{ st: number }>`
    WITH posodobljeni AS (
      UPDATE kontakti k SET oznake = CASE
        WHEN k.oznake = '' THEN p.oznaka
        WHEN position(p.oznaka in k.oznake) > 0 THEN k.oznake
        ELSE k.oznake || ';' || p.oznaka END
      FROM prijave p
      WHERE lower(k.email) = lower(p.email)
        AND p.program = ${program_slug}
        AND p.oznaka IS NOT NULL AND p.oznaka <> ''
      RETURNING k.id
    )
    SELECT COUNT(*)::int AS st FROM posodobljeni;`;
  return r.rows[0]?.st ?? 0;
}
