// Instagram @alpskasola — zadnje objave za domačo stran (samo strežnik).
// Žeton: Vercel spremenljivka INSTAGRAM_TOKEN (+ INSTAGRAM_USER_ID pri sistemskem žetonu).
// Brez INSTAGRAM_USER_ID: Ker velja 60 dni, ga sami
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

// Vrže napako, če ni žetona ali objav — tako prazen rezultat NI predpomnjen
// in se objave pokažejo takoj, ko je žeton nastavljen.
async function nalozi(stevilo: number): Promise<IgObjava[]> {
  const polja = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const igId = process.env.INSTAGRAM_USER_ID?.trim();
  let url: string;
  if (igId) {
    // Nov način (Unified login, sistemski žeton, ki ne poteče) → Facebook Graph API
    const token = process.env.INSTAGRAM_TOKEN?.trim();
    if (!token) throw new Error("INSTAGRAM_TOKEN ni nastavljen");
    url = `https://graph.facebook.com/v21.0/${igId}/media?fields=${polja}&limit=${stevilo}&access_token=${token}`;
  } else {
    // Star način (Instagram login, žeton 60 dni, sami ga osvežujemo)
    const token = await zeton();
    if (!token) throw new Error("INSTAGRAM_TOKEN ni nastavljen");
    url = `${API}/me/media?fields=${polja}&limit=${stevilo}&access_token=${token}`;
  }
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Instagram API ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const objave = ((j.data ?? []) as any[])
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
  if (!objave.length) throw new Error("Instagram ni vrnil objav");
  return objave;
}

// Predpomnjeno 30 minut — nova objava je na strani najkasneje v pol ure.
const nalozenoPredpomnjeno = unstable_cache(nalozi, ["alpska-instagram-objave-v2"], {
  revalidate: 1800,
});

export async function pridobiInstagramObjave(stevilo: number): Promise<IgObjava[]> {
  try {
    return await nalozenoPredpomnjeno(stevilo);
  } catch (e) {
    console.error("[instagram]", e instanceof Error ? e.message : e);
    return [];
  }
}
