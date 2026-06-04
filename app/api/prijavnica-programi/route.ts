import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

// Vedno beri svežo bazo (brez predpomnjenja)
export const dynamic = "force-dynamic";

// GET → vsi programi z oznako, ali so na prijavnici (za CRM)
export async function GET() {
  try {
    const r = await sql`
      SELECT id, slug, naziv, COALESCE(na_prijavnici, false) AS na_prijavnici, aktiven
      FROM programi
      ORDER BY naziv;
    `;
    return NextResponse.json({ programi: r.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// PUT { slug, na_prijavnici } → vklopi/izklopi program na prijavnici
export async function PUT(req: Request) {
  try {
    const { slug, na_prijavnici } = await req.json();
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
