// Instagram @alpskasola — zadnje objave za domačo stran (samo strežnik).
// Žeton: Vercel spremenljivka INSTAGRAM_TOKEN. Ker velja 60 dni, ga sami
// osvežujemo in osveženega hranimo v Neon tabeli `instagram_zeton`.
// Če v Vercel prilepiš nov žeton, se tabela samodejno ponastavi nanj.
import { sql } from "@vercel/postgres";
import { unstable_cache } from "next/cache";

const API = "https://graph.instagram.com";
const OSVEZI_PO_DNEVIH = 7;

export type IgObjava = {
  id: string;
  tip: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  slika: string;
  video: string | null;
  povezava: string;
  opis: string;
  datum: string;
};

async function zeton(): Promise<string | null> {
  const izOkolja = process.env.INSTAGRAM_TOKEN?.trim();
  if (!izOkolja) return null;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS instagram_zeton (
        id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        token TEXT NOT NULL,
        vir TEXT NOT NULL,
        osvezen TIMESTAMPTZ NOT NULL DEFAULT now()
      );`;
    const { rows } = await sql`SELECT token, vir, osvezen FROM instagram_zeton WHERE id = 1`;
    let vrstica = rows[0] as { token: string; vir: string; osvezen: string } | undefined;

    // Ni zapisa ali je v Vercel nov žeton → začni z njim
    if (!vrstica || vrstica.vir !== izOkolja) {
      await sql`
        INSERT INTO instagram_zeton (id, token, vir, osvezen)
        VALUES (1, ${izOkolja}, ${izOkolja}, now())
        ON CONFLICT (id) DO UPDATE SET token = EXCLUDED.token, vir = EXCLUDED.vir, osvezen = now();`;
      vrstica = { token: izOkolja, vir: izOkolja, osvezen: new Date().toISOString() };
    }

    let token = vrstica.token;
    const star = Date.now() - new Date(vrstica.osvezen).getTime() > OSVEZI_PO_DNEVIH * 864e5;
    if (star) {
      try {
        const r = await fetch(
          `${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
          { cache: "no-store" }
        );
        const j = await r.json();
        if (j.access_token) {
          token = j.access_token;
          await sql`UPDATE instagram_zeton SET token = ${token}, osvezen = now() WHERE id = 1`;
        }
      } catch {
        // osvežitev ni uspela — poskusimo ob naslednjem branju
      }
    }
    return token;
  } catch {
    // baza ni dosegljiva → uporabi žeton iz okolja
    return izOkolja;
  }
}

async function nalozi(stevilo: number): Promise<IgObjava[]> {
  try {
    const token = await zeton();
    if (!token) return [];
    const polja = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
    const r = await fetch(`${API}/me/media?fields=${polja}&limit=${stevilo}&access_token=${token}`, {
      cache: "no-store",
    });
    if (!r.ok) return [];
    const j = await r.json();
    return ((j.data ?? []) as any[])
      .map((m) => ({
        id: String(m.id),
        tip: m.media_type,
        slika: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
        video: m.media_type === "VIDEO" ? m.media_url : null,
        povezava: m.permalink,
        opis: String(m.caption ?? "").trim(),
        datum: m.timestamp,
      }))
      .filter((m) => !!m.slika) as IgObjava[];
  } catch {
    return [];
  }
}

// Predpomnjeno 30 minut — nova objava je na strani najkasneje v pol ure.
export const pridobiInstagramObjave = unstable_cache(nalozi, ["alpska-instagram-objave"], {
  revalidate: 1800,
});
