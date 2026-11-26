import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { posodobiStatus, pridobiProgrami, Prijava } from "@/lib/db";
import { posljiPotrjenoStarsu } from "@/lib/email";
import { pridobiTrenutniAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Status lahko spreminja samo prijavljen admin
  if (!(await pridobiTrenutniAdmin())) {
    return NextResponse.json({ error: "Ni dovoljenja" }, { status: 401 });
  }
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Manjka id ali status" }, { status: 400 });
    }

    // Preberi trenutno stanje (da emaila ne pošljemo dvakrat)
    const r = await sql<Prijava>`SELECT * FROM prijave WHERE id = ${id};`;
    const prijava = r.rows[0];
    const prejsnjiStatus = prijava?.status;

    await posodobiStatus(id, status);

    // Ob prehodu v "potrjeno" pošlji staršu email s potrditvijo
    if (prijava && status === "potrjeno" && prejsnjiStatus !== "potrjeno") {
      try {
        const programi = await pridobiProgrami();
        const programNaziv =
          programi.find((p) => p.slug === prijava.program)?.naziv || prijava.program;
        await posljiPotrjenoStarsu(prijava, programNaziv);
      } catch (e) {
        console.error("Napaka pri pošiljanju potrditvenega emaila:", e);
      }
    }

    return NextResponse.json({ uspeh: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
