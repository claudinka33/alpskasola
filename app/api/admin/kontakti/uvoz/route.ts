import { NextRequest, NextResponse } from "next/server";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { upsertKontakt } from "@/lib/db";
import { zagotoviTabele } from "@/lib/migracije";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST → uvoz paketa kontaktov [{ime, priimek, email, telefon, otrok, oznake, narocen, vir}]
// Klient pošilja v paketih (npr. po 100), da ne zadenemo časovne omejitve.
export async function POST(req: NextRequest) {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    await zagotoviTabele();

    const { kontakti } = await req.json();
    if (!Array.isArray(kontakti)) {
      return NextResponse.json({ error: "Manjka seznam kontaktov" }, { status: 400 });
    }
    let uvozeni = 0;
    let preskoceni = 0;
    for (const k of kontakti.slice(0, 200)) {
      const email = (k.email || "").trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        preskoceni++;
        continue;
      }
      await upsertKontakt(k);
      uvozeni++;
    }
    return NextResponse.json({ uvozeni, preskoceni });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
