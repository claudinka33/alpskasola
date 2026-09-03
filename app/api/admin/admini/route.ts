import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pridobiTrenutniAdmin, pridobiAdminaSPravicami } from "@/lib/auth";
import { VSI_KLJUCI } from "@/lib/pravice";

// Uporabnike sme urejati samo skrbnik
async function samoSkrbnik() {
  const a = await pridobiAdminaSPravicami();
  return a && a.vloga === "admin" ? a : null;
}

export const dynamic = "force-dynamic";

// GET → seznam uporabnikov
export async function GET() {
  const me = await pridobiTrenutniAdmin();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 401 });
  try {
    await sql`ALTER TABLE admini ADD COLUMN IF NOT EXISTS pravice TEXT;`;
    const r = await sql`
      SELECT id, ime, email, vloga, pravice, ustvarjeno
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
  const me = await samoSkrbnik();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
  try {
    const { ime, email, geslo, vloga, pravice } = await req.json();
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
    const cistePravice = Array.isArray(pravice)
      ? pravice.filter((k: string) => VSI_KLJUCI.includes(k))
      : [];
    await sql`ALTER TABLE admini ADD COLUMN IF NOT EXISTS pravice TEXT;`;
    await sql`
      INSERT INTO admini (ime, email, geslo_hash, vloga, pravice)
      VALUES (${ime}, ${email}, ${hash}, ${vloga === "admin" ? "admin" : "zaposleni"},
              ${JSON.stringify(cistePravice)});
    `;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// PUT → zamenjaj geslo { id, geslo }  ali  uredi uporabnika { id, ime, email, vloga, pravice }
export async function PUT(req: Request) {
  const me = await samoSkrbnik();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
  try {
    const d = await req.json();
    const id = Number(d.id);
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });

    if (d.geslo) {
      if (String(d.geslo).length < 6) {
        return NextResponse.json({ error: "Geslo naj ima vsaj 6 znakov." }, { status: 400 });
      }
      const hash = await bcrypt.hash(String(d.geslo), 10);
      await sql`UPDATE admini SET geslo_hash = ${hash} WHERE id = ${id};`;
      return NextResponse.json({ ok: true });
    }

    if (!d.ime || !d.email) {
      return NextResponse.json({ error: "Izpolni ime in email." }, { status: 400 });
    }

    const zaseden = await sql`SELECT id FROM admini WHERE email = ${d.email} AND id <> ${id};`;
    if (zaseden.rows.length) {
      return NextResponse.json({ error: "Ta email že uporablja drug uporabnik." }, { status: 409 });
    }

    const novaVloga = d.vloga === "admin" ? "admin" : "zaposleni";

    // Zadnji skrbnik ne sme ostati brez skrbniške vloge
    if (novaVloga !== "admin") {
      const skrbnikov = await sql`SELECT COUNT(*)::int AS n FROM admini WHERE vloga = 'admin';`;
      const jeBilSkrbnik = await sql`SELECT vloga FROM admini WHERE id = ${id};`;
      if (jeBilSkrbnik.rows[0]?.vloga === "admin" && (skrbnikov.rows[0]?.n ?? 0) <= 1) {
        return NextResponse.json({ error: "Vsaj en skrbnik mora ostati." }, { status: 400 });
      }
    }

    const cistePravice = Array.isArray(d.pravice)
      ? d.pravice.filter((k: string) => VSI_KLJUCI.includes(k))
      : [];

    await sql`ALTER TABLE admini ADD COLUMN IF NOT EXISTS pravice TEXT;`;
    await sql`
      UPDATE admini SET ime = ${d.ime}, email = ${d.email}, vloga = ${novaVloga},
        pravice = ${JSON.stringify(cistePravice)}
      WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// DELETE ?id= → izbriši uporabnika
export async function DELETE(req: Request) {
  const me = await samoSkrbnik();
  if (!me) return NextResponse.json({ error: "Ni dovoljenja" }, { status: 403 });
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
