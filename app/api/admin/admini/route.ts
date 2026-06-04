import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pridobiTrenutniAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET → seznam uporabnikov
export async function GET() {
  const me = await pridobiTrenutniAdmin();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 401 });
  try {
    const r = await sql`
      SELECT id, ime, email, vloga, ustvarjeno
      FROM admini
      ORDER BY ustvarjeno ASC;
    `;
    return NextResponse.json({ admini: r.rows });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// POST → dodaj uporabnika { ime, email, geslo, vloga }
export async function POST(req: Request) {
  const me = await pridobiTrenutniAdmin();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 401 });
  try {
    const { ime, email, geslo, vloga } = await req.json();
    if (!ime || !email || !geslo) {
      return NextResponse.json({ error: "Izpolni ime, email in geslo." }, { status: 400 });
    }
    if (String(geslo).length < 6) {
      return NextResponse.json({ error: "Geslo naj ima vsaj 6 znakov." }, { status: 400 });
    }

    const obstaja = await sql`SELECT id FROM admini WHERE email = ${email};`;
    if (obstaja.rows.length) {
      return NextResponse.json({ error: "Uporabnik s tem emailom že obstaja." }, { status: 409 });
    }

    const hash = await bcrypt.hash(String(geslo), 10);
    await sql`
      INSERT INTO admini (ime, email, geslo_hash, vloga)
      VALUES (${ime}, ${email}, ${hash}, ${vloga === "admin" ? "admin" : "zaposleni"});
    `;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// DELETE ?id= → izbriši uporabnika
export async function DELETE(req: Request) {
  const me = await pridobiTrenutniAdmin();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 401 });
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    if (id === me.id) {
      return NextResponse.json({ error: "Svojega računa ne moreš izbrisati." }, { status: 400 });
    }
    const cnt = await sql`SELECT COUNT(*)::int AS n FROM admini;`;
    if ((cnt.rows[0]?.n ?? 0) <= 1) {
      return NextResponse.json({ error: "Vsaj en uporabnik mora ostati." }, { status: 400 });
    }
    await sql`DELETE FROM admini WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}
