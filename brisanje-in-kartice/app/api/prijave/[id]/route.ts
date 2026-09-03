import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { pridobiTrenutniAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) return NextResponse.json({ error: "Nedovoljeno" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Neveljaven ID" }, { status: 400 });

  const r = await sql`SELECT * FROM prijave WHERE id = ${id} LIMIT 1;`;
  if (!r.rows[0]) return NextResponse.json({ error: "Ni najdeno" }, { status: 404 });
  return NextResponse.json({ prijava: r.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) return NextResponse.json({ error: "Nedovoljeno" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Neveljaven ID" }, { status: 400 });

  const d = await req.json();
  const cena =
    d.cena === "" || d.cena === null || d.cena === undefined ? null : Number(d.cena);

  await sql`
    UPDATE prijave SET
      program = ${d.program},
      otrok_ime = ${d.otrok_ime},
      otrok_priimek = ${d.otrok_priimek},
      otrok_rojstvo = ${d.otrok_rojstvo},
      otrok_znanje = ${d.otrok_znanje || null},
      starsi_ime = ${d.starsi_ime},
      starsi_priimek = ${d.starsi_priimek},
      email = ${d.email},
      telefon = ${d.telefon},
      naslov = ${d.naslov || null},
      posta = ${d.posta || null},
      opomba = ${d.opomba || null},
      termin = ${d.termin || null},
      cena = ${cena},
      status = ${d.status || "nova"},
      posodobljeno = NOW()
    WHERE id = ${id};
  `;

  return NextResponse.json({ uspeh: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) return NextResponse.json({ error: "Nedovoljeno" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Neveljaven ID" }, { status: 400 });

  // Pobriši še vse, kar visi na tej prijavi (plačila, prisotnost)
  try {
    await sql`DELETE FROM placila WHERE prijava_id = ${id};`;
    await sql`DELETE FROM prisotnost WHERE prijava_id = ${id};`;
  } catch (e) {
    console.error("Čiščenje ob brisanju prijave:", e);
  }
  await sql`DELETE FROM prijave WHERE id = ${id};`;
  return NextResponse.json({ uspeh: true });
}
