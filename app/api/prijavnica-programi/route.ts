import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// Vedno beri svežo bazo (brez predpomnjenja)
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET → vsi programi z oznako, ali so na prijavnici (za CRM)
export async function GET() {
  try {
    await sql`ALTER TABLE programi ADD COLUMN IF NOT EXISTS vrstni_red INT;`;
    const r = await sql`
      SELECT id, slug, naziv, COALESCE(na_prijavnici, false) AS na_prijavnici, aktiven, vrstni_red
      FROM programi
      ORDER BY COALESCE(vrstni_red, 9999), naziv;
    `;
    return NextResponse.json({ programi: r.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// PUT { slug, na_prijavnici } → vklopi/izklopi program na prijavnici
// PUT { vrstni_red: [slug, slug, ...] } → shrani vrstni red programov
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body.vrstni_red)) {
      await sql`ALTER TABLE programi ADD COLUMN IF NOT EXISTS vrstni_red INT;`;
      const slugi: string[] = body.vrstni_red.filter((s: unknown) => typeof s === "string");
      for (let i = 0; i < slugi.length; i++) {
        await sql`UPDATE programi SET vrstni_red = ${i + 1} WHERE slug = ${slugi[i]};`;
      }
      return NextResponse.json({ ok: true });
    }
    const { slug, na_prijavnici } = body;
    if (!slug) {
      return NextResponse.json({ error: "Manjka slug" }, { status: 400 });
    }
    await sql`
      UPDATE programi
      SET na_prijavnici = ${!!na_prijavnici}
      WHERE slug = ${slug};
    `;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}
