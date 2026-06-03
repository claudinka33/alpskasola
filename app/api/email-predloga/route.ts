import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const PRIVZETO = {
  zadeva: "Prejeli smo vašo prijavo",
  naslov: "Hvala za prijavo!",
  vsebina:
    "Vašo prijavo smo uspešno prejeli in vas bomo v kratkem kontaktirali z vsemi podrobnostmi.",
};

// GET → trenutno besedilo maila
export async function GET() {
  try {
    const r = await sql`SELECT zadeva, naslov, vsebina FROM email_predloga WHERE id = 1;`;
    return NextResponse.json({ predloga: r.rows[0] || PRIVZETO });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// PUT { zadeva, naslov, vsebina } → shrani
export async function PUT(req: Request) {
  try {
    const { zadeva, naslov, vsebina } = await req.json();
    if (!zadeva || !naslov || !vsebina) {
      return NextResponse.json({ error: "Izpolni vsa polja." }, { status: 400 });
    }
    await sql`
      INSERT INTO email_predloga (id, zadeva, naslov, vsebina, posodobljeno)
      VALUES (1, ${zadeva}, ${naslov}, ${vsebina}, now())
      ON CONFLICT (id) DO UPDATE
        SET zadeva = EXCLUDED.zadeva,
            naslov = EXCLUDED.naslov,
            vsebina = EXCLUDED.vsebina,
            posodobljeno = now();
    `;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}
