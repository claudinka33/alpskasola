import { NextRequest, NextResponse } from "next/server";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { pridobiKontakte, upsertKontakt, izbrisiKontakt } from "@/lib/db";
import { sql } from "@vercel/postgres";
import { zagotoviTabele } from "@/lib/migracije";

export const dynamic = "force-dynamic";

async function zahtevajAdmina() {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) throw new Error("unauthorized");
}

export async function GET(req: NextRequest) {
  try {
    await zahtevajAdmina();
    await zagotoviTabele();
    const sp = new URL(req.url).searchParams;
    const narocenParam = sp.get("narocen");
    const kontakti = await pridobiKontakte({
      iskanje: sp.get("iskanje") || undefined,
      oznaka: sp.get("oznaka") || undefined,
      narocen: narocenParam === null ? undefined : narocenParam === "true",
    });
    return NextResponse.json({ kontakti });
  } catch (e: any) {
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}

// POST → ročno dodaj kontakt
export async function POST(req: NextRequest) {
  try {
    await zahtevajAdmina();
    await zagotoviTabele();
    const d = await req.json();
    if (!d.email) return NextResponse.json({ error: "Manjka email" }, { status: 400 });
    const kontakt = await upsertKontakt({ ...d, vir: d.vir || "Ročni vnos" });
    return NextResponse.json({ kontakt }, { status: 201 });
  } catch (e: any) {
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}

// PUT → uredi kontakt
// Posodobi samo polja, ki so poslana. Polja, ki jih ni v zahtevi, ostanejo nespremenjena.
// Prazen niz ("") polje izprazni.
// Podpira tudi star klic { id, narocen } za preklop naročenosti.
export async function PUT(req: NextRequest) {
  try {
    await zahtevajAdmina();
    const d = await req.json();

    const id = Number(d.id);
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });

    // undefined → null (COALESCE ohrani obstoječo vrednost)
    const t = (v: any) => (v === undefined ? null : v === null ? "" : String(v).trim());

    let email: string | null = null;
    if (d.email !== undefined) {
      email = String(d.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return NextResponse.json({ error: "Email ni veljaven." }, { status: 400 });
      }
    }

    const narocen = d.narocen === undefined ? null : !!d.narocen;

    const r = await sql`
      UPDATE kontakti SET
        ime      = COALESCE(${t(d.ime)}::text, ime),
        priimek  = COALESCE(${t(d.priimek)}::text, priimek),
        email    = COALESCE(${email}::text, email),
        telefon  = COALESCE(${t(d.telefon)}::text, telefon),
        otrok    = COALESCE(${t(d.otrok)}::text, otrok),
        oznake   = COALESCE(${t(d.oznake)}::text, oznake),
        narocen  = COALESCE(${narocen}::boolean, narocen)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (r.rows.length === 0) {
      return NextResponse.json({ error: "Kontakt ne obstaja." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, kontakt: r.rows[0] });
  } catch (e: any) {
    if (e?.code === "23505") {
      return NextResponse.json(
        { error: "Ta email že obstaja v bazi." },
        { status: 409 }
      );
    }
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await zahtevajAdmina();
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiKontakt(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}
