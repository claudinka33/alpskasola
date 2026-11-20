// lib/galerija.ts — fotografije in YouTube videi na javnih straneh programov.
// Ureja se v CMS: /admin/galerija. Tabela se ustvari sama ob prvem klicu.

import { sql } from "@vercel/postgres";

let izvedeno = false;

export type GalerijaPostavka = {
  id: number;
  program_slug: string;
  tip: "slika" | "video";
  url: string; // slika: /api/datoteke/ID ali /pot.jpg · video: YouTube ID
  naslov: string | null;
  vrstni_red: number;
};

export async function zagotoviGalerijo() {
  if (izvedeno) return;
  await sql`
    CREATE TABLE IF NOT EXISTS galerija (
      id SERIAL PRIMARY KEY,
      program_slug TEXT NOT NULL,
      tip TEXT NOT NULL DEFAULT 'slika',
      url TEXT NOT NULL,
      naslov TEXT,
      vrstni_red INT NOT NULL DEFAULT 0,
      ustvarjeno TIMESTAMPTZ NOT NULL DEFAULT now()
    );`;
  await sql`CREATE INDEX IF NOT EXISTS galerija_program_idx ON galerija (program_slug, tip, vrstni_red);`;
  izvedeno = true;
}

// Iz povezave (youtu.be/…, youtube.com/watch?v=…, /shorts/…, /embed/…) ali golega ID-ja vrne ID videa.
export function youtubeId(vnos: string): string | null {
  const s = String(vnos || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([A-Za-z0-9_-]{11})/) ||
    s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    s.match(/\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export async function pridobiGalerijo(program_slug: string) {
  await zagotoviGalerijo();
  const r = await sql<GalerijaPostavka>`
    SELECT id, program_slug, tip, url, naslov, vrstni_red
    FROM galerija WHERE program_slug = ${program_slug}
    ORDER BY vrstni_red, id;`;
  return r.rows;
}

export async function dodajVGalerijo(d: {
  program_slug: string;
  tip: "slika" | "video";
  url: string;
  naslov?: string | null;
}) {
  await zagotoviGalerijo();
  const max = await sql<{ m: number }>`
    SELECT COALESCE(MAX(vrstni_red), -1)::int AS m FROM galerija
    WHERE program_slug = ${d.program_slug} AND tip = ${d.tip};`;
  const r = await sql<GalerijaPostavka>`
    INSERT INTO galerija (program_slug, tip, url, naslov, vrstni_red)
    VALUES (${d.program_slug}, ${d.tip}, ${d.url}, ${d.naslov || null}, ${max.rows[0].m + 1})
    RETURNING id, program_slug, tip, url, naslov, vrstni_red;`;
  return r.rows[0];
}

export async function posodobiGalerijo(id: number, d: { naslov?: string | null }) {
  await zagotoviGalerijo();
  await sql`UPDATE galerija SET naslov = ${d.naslov || null} WHERE id = ${id};`;
}

// Zamenja mesto z sosedom (gor/dol) znotraj istega programa in tipa
export async function premakniVGaleriji(id: number, smer: "gor" | "dol") {
  await zagotoviGalerijo();
  const t = (await sql<GalerijaPostavka>`SELECT * FROM galerija WHERE id = ${id};`).rows[0];
  if (!t) return;
  const vsi = (
    await sql<GalerijaPostavka>`
      SELECT id, vrstni_red FROM galerija
      WHERE program_slug = ${t.program_slug} AND tip = ${t.tip}
      ORDER BY vrstni_red, id;`
  ).rows;
  const i = vsi.findIndex((x) => x.id === id);
  const j = smer === "gor" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= vsi.length) return;
  [vsi[i], vsi[j]] = [vsi[j], vsi[i]];
  // Na novo oštevilči celoten seznam, da ni podvojenih vrstnih redov
  for (let k = 0; k < vsi.length; k++) {
    await sql`UPDATE galerija SET vrstni_red = ${k} WHERE id = ${vsi[k].id};`;
  }
}

export async function izbrisiIzGalerije(id: number) {
  await zagotoviGalerijo();
  const r = await sql<{ url: string; tip: string }>`
    DELETE FROM galerija WHERE id = ${id} RETURNING url, tip;`;
  return r.rows[0] || null;
}
