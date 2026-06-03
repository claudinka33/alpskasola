import { sql } from "@vercel/postgres";

export type Prijava = {
  id: number;
  program: string;
  otrok_ime: string;
  otrok_priimek: string;
  otrok_rojstvo: string;
  otrok_znanje: string | null;
  starsi_ime: string;
  starsi_priimek: string;
  email: string;
  telefon: string;
  naslov: string | null;
  posta: string | null;
  opomba: string | null;
  status: string;
  termin: string | null;
  cena: number | null;
  ustvarjeno: string;
};

export type Program = {
  id: number;
  slug: string;
  naziv: string;
  opis: string | null;
  aktiven: boolean;
  cena_od: number | null;
  ustvarjeno: string;
};

export async function ustvariPrijavo(data: Omit<Prijava, "id" | "status" | "ustvarjeno">) {
  const result = await sql<Prijava>`
    INSERT INTO prijave (
      program, otrok_ime, otrok_priimek, otrok_rojstvo, otrok_znanje,
      starsi_ime, starsi_priimek, email, telefon, naslov, posta, opomba, termin, cena
    ) VALUES (
      ${data.program}, ${data.otrok_ime}, ${data.otrok_priimek}, ${data.otrok_rojstvo}, ${data.otrok_znanje},
      ${data.starsi_ime}, ${data.starsi_priimek}, ${data.email}, ${data.telefon},
      ${data.naslov}, ${data.posta}, ${data.opomba}, ${data.termin}, ${data.cena}
    ) RETURNING *;
  `;
  return result.rows[0];
}

export async function pridobiPrijave(filter?: { program?: string; status?: string; iskanje?: string }) {
  if (filter?.iskanje) {
    const q = `%${filter.iskanje}%`;
    const r = await sql<Prijava>`SELECT * FROM prijave WHERE otrok_ime ILIKE ${q} OR otrok_priimek ILIKE ${q} OR email ILIKE ${q} OR telefon ILIKE ${q} ORDER BY ustvarjeno DESC;`;
    return r.rows;
  }
  if (filter?.program && filter?.status) {
    const r = await sql<Prijava>`SELECT * FROM prijave WHERE program = ${filter.program} AND status = ${filter.status} ORDER BY ustvarjeno DESC;`;
    return r.rows;
  }
  if (filter?.program) {
    const r = await sql<Prijava>`SELECT * FROM prijave WHERE program = ${filter.program} ORDER BY ustvarjeno DESC;`;
    return r.rows;
  }
  if (filter?.status) {
    const r = await sql<Prijava>`SELECT * FROM prijave WHERE status = ${filter.status} ORDER BY ustvarjeno DESC;`;
    return r.rows;
  }
  const r = await sql<Prijava>`SELECT * FROM prijave ORDER BY ustvarjeno DESC;`;
  return r.rows;
}

export async function posodobiStatus(id: number, status: string) {
  await sql`UPDATE prijave SET status = ${status} WHERE id = ${id};`;
}

export async function pridobiProgrami() {
  const r = await sql<Program>`SELECT * FROM programi ORDER BY naziv;`;
  return r.rows;
}

export async function pridobiProgramiAktivni() {
  const r = await sql<Program>`SELECT * FROM programi WHERE aktiven = true ORDER BY naziv;`;
  return r.rows;
}

export async function ustvariProgram(slug: string, naziv: string, opis?: string, cena_od?: number) {
  const r = await sql<Program>`INSERT INTO programi (slug, naziv, opis, cena_od) VALUES (${slug}, ${naziv}, ${opis || null}, ${cena_od || null}) RETURNING *;`;
  return r.rows[0];
}

export async function posodobiProgram(id: number, data: Partial<Program>) {
  await sql`UPDATE programi SET naziv = COALESCE(${data.naziv}, naziv), opis = COALESCE(${data.opis}, opis), aktiven = COALESCE(${data.aktiven}, aktiven), cena_od = COALESCE(${data.cena_od}, cena_od) WHERE id = ${id};`;
}

export async function izbrisiProgram(id: number) {
  await sql`DELETE FROM programi WHERE id = ${id};`;
}

export async function pridobiAdminPoEmailu(email: string) {
  const r = await sql`SELECT * FROM admini WHERE email = ${email};`;
  return r.rows[0];
}

export async function pridobiStatistiko() {
  const skupaj = await sql`SELECT COUNT(*)::int AS c FROM prijave;`;
  const nove = await sql`SELECT COUNT(*)::int AS c FROM prijave WHERE status = 'nova';`;
  const potrjene = await sql`SELECT COUNT(*)::int AS c FROM prijave WHERE status = 'potrjeno';`;
  const placane = await sql`SELECT COUNT(*)::int AS c FROM prijave WHERE status = 'placano';`;
  const poProgramih = await sql`SELECT program, COUNT(*)::int AS stevilo FROM prijave GROUP BY program ORDER BY stevilo DESC;`;
  return {
    skupaj: skupaj.rows[0].c as number,
    nove: nove.rows[0].c as number,
    potrjene: potrjene.rows[0].c as number,
    placane: placane.rows[0].c as number,
    poProgramih: poProgramih.rows as { program: string; stevilo: number }[],
  };
}
// ============================================================
//  DODAJ TO NA KONEC datoteke lib/db.ts
//  (sql je že importan na vrhu datoteke — ne dodajaj znova)
// ============================================================

// ---------- TERMINI ----------
export type Termin = {
  id: number;
  program_slug: string;
  naziv: string;
  lokacija: string | null;
  datum_od: string | null;
  datum_do: string | null;
  cena: number | null;
  status: string;
  aktiven: boolean;
  sezona: string | null;
  vrstni_red: number;
  opomba: string | null;
  ustvarjeno: string;
};

export async function pridobiTermini(program_slug?: string) {
  if (program_slug) {
    const r = await sql<Termin>`SELECT * FROM termini WHERE program_slug = ${program_slug} ORDER BY vrstni_red, datum_od NULLS LAST, id;`;
    return r.rows;
  }
  const r = await sql<Termin>`SELECT * FROM termini ORDER BY program_slug, vrstni_red, datum_od NULLS LAST, id;`;
  return r.rows;
}

export async function pridobiTerminiAktivni(program_slug: string) {
  const r = await sql<Termin>`SELECT * FROM termini WHERE program_slug = ${program_slug} AND aktiven = true ORDER BY vrstni_red, datum_od NULLS LAST, id;`;
  return r.rows;
}

export async function ustvariTermin(d: Partial<Termin>) {
  const r = await sql<Termin>`
    INSERT INTO termini (program_slug, naziv, lokacija, datum_od, datum_do, cena, status, aktiven, sezona, vrstni_red, opomba)
    VALUES (${d.program_slug!}, ${d.naziv!}, ${d.lokacija || null}, ${d.datum_od || null}, ${d.datum_do || null},
            ${d.cena ?? null}, ${d.status || "odprt"}, ${d.aktiven ?? true}, ${d.sezona || null}, ${d.vrstni_red ?? 0}, ${d.opomba || null})
    RETURNING *;`;
  return r.rows[0];
}

export async function posodobiTermin(id: number, d: Partial<Termin>) {
  await sql`UPDATE termini SET
    naziv = ${d.naziv!}, lokacija = ${d.lokacija || null},
    datum_od = ${d.datum_od || null}, datum_do = ${d.datum_do || null},
    cena = ${d.cena ?? null}, status = ${d.status || "odprt"},
    aktiven = ${d.aktiven ?? true}, sezona = ${d.sezona || null},
    vrstni_red = ${d.vrstni_red ?? 0}, opomba = ${d.opomba || null}
    WHERE id = ${id};`;
}

export async function nastaviTerminAktiven(id: number, aktiven: boolean) {
  await sql`UPDATE termini SET aktiven = ${aktiven} WHERE id = ${id};`;
}

export async function izbrisiTermin(id: number) {
  await sql`DELETE FROM termini WHERE id = ${id};`;
}

// ---------- ROJSTNI DAN: PAKETI ----------
export type RdPaket = {
  id: number;
  value: string;
  label: string;
  opis: string | null;
  ima_aktivnosti: boolean;
  aktiven: boolean;
  vrstni_red: number;
};

export async function pridobiRdPakete() {
  const r = await sql<RdPaket>`SELECT * FROM rd_paketi ORDER BY vrstni_red, id;`;
  return r.rows;
}

export async function ustvariRdPaket(d: Partial<RdPaket>) {
  const r = await sql<RdPaket>`
    INSERT INTO rd_paketi (value, label, opis, ima_aktivnosti, aktiven, vrstni_red)
    VALUES (${d.value!}, ${d.label!}, ${d.opis || null}, ${d.ima_aktivnosti ?? false}, ${d.aktiven ?? true}, ${d.vrstni_red ?? 0})
    RETURNING *;`;
  return r.rows[0];
}

export async function posodobiRdPaket(id: number, d: Partial<RdPaket>) {
  await sql`UPDATE rd_paketi SET
    label = ${d.label!}, opis = ${d.opis || null},
    ima_aktivnosti = ${d.ima_aktivnosti ?? false}, aktiven = ${d.aktiven ?? true},
    vrstni_red = ${d.vrstni_red ?? 0}
    WHERE id = ${id};`;
}

export async function izbrisiRdPaket(id: number) {
  await sql`DELETE FROM rd_paketi WHERE id = ${id};`;
}

// ---------- ROJSTNI DAN: AKTIVNOSTI ----------
export type RdAktivnost = {
  id: number;
  label: string;
  aktiven: boolean;
  vrstni_red: number;
};

export async function pridobiRdAktivnosti() {
  const r = await sql<RdAktivnost>`SELECT * FROM rd_aktivnosti ORDER BY vrstni_red, id;`;
  return r.rows;
}

export async function ustvariRdAktivnost(d: Partial<RdAktivnost>) {
  const r = await sql<RdAktivnost>`
    INSERT INTO rd_aktivnosti (label, aktiven, vrstni_red)
    VALUES (${d.label!}, ${d.aktiven ?? true}, ${d.vrstni_red ?? 0})
    RETURNING *;`;
  return r.rows[0];
}

export async function posodobiRdAktivnost(id: number, d: Partial<RdAktivnost>) {
  await sql`UPDATE rd_aktivnosti SET label = ${d.label!}, aktiven = ${d.aktiven ?? true}, vrstni_red = ${d.vrstni_red ?? 0} WHERE id = ${id};`;
}

export async function izbrisiRdAktivnost(id: number) {
  await sql`DELETE FROM rd_aktivnosti WHERE id = ${id};`;
}
