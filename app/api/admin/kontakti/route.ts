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

// PUT → posodobi naročenost { id, narocen }
export async function PUT(req: NextRequest) {
  try {
    await zahtevajAdmina();
    const { id, narocen } = await req.json();
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await sql`UPDATE kontakti SET narocen = ${!!narocen} WHERE id = ${id};`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
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
