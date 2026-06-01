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
