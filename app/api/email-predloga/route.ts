import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const PRIVZETO_PREJEM = {
  zadeva: "Prejeli smo vašo prijavo",
  naslov: "Hvala za prijavo!",
  vsebina:
    "Vašo prijavo smo uspešno prejeli in vas bomo v kratkem kontaktirali z vsemi podrobnostmi.",
};

const PRIVZETO_POTRDITEV = {
  zadeva: "Vaša prijava je potrjena",
  naslov: "Prijava je potrjena! 🎉",
  vsebina:
    "Z veseljem sporočamo, da je prijava vašega otroka potrjena. Vse podrobnosti najdete v povzetku spodaj. Se vidimo!",
};

// GET → obe predlogi (ob prejemu in ob potrditvi)
export async function GET() {
  try {
    const r = await sql`SELECT id, zadeva, naslov, vsebina FROM email_predloga WHERE id IN (1, 2);`;
    const prejem = r.rows.find((x) => x.id === 1) || PRIVZETO_PREJEM;
    const potrditev = r.rows.find((x) => x.id === 2) || PRIVZETO_POTRDITEV;
    return NextResponse.json({ predloga: prejem, potrditev });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}

// PUT { tip?: "prejem" | "potrditev", zadeva, naslov, vsebina } → shrani
export async function PUT(req: Request) {
  try {
    const { tip, zadeva, naslov, vsebina } = await req.json();
    if (!zadeva || !naslov || !vsebina) {
      return NextResponse.json({ error: "Izpolni vsa polja." }, { status: 400 });
    }
    const id = tip === "potrditev" ? 2 : 1;
    await sql`
      INSERT INTO email_predloga (id, zadeva, naslov, vsebina, posodobljeno)
      VALUES (${id}, ${zadeva}, ${naslov}, ${vsebina}, now())
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
