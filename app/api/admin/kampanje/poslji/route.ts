import { NextRequest, NextResponse } from "next/server";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { posodobiKampanjo } from "@/lib/db";
import { posljiKampanjoPaket } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST → { kampanjaId, zadeva, naslov, vsebina, prejemniki: string[] (do 50), poslanoDoslej, koncano }
// Klient pošilja pakete zaporedoma in prikazuje napredek.
export async function POST(req: NextRequest) {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const d = await req.json();
    if (!d.kampanjaId || !Array.isArray(d.prejemniki)) {
      return NextResponse.json({ error: "Manjkajo podatki" }, { status: 400 });
    }
    const paket = d.prejemniki.slice(0, 50);
    let poslano = 0;
    if (paket.length > 0) {
      poslano = await posljiKampanjoPaket(paket, d.zadeva, d.naslov || "", d.vsebina);
    }
    const skupaj = (d.poslanoDoslej || 0) + poslano;
    await posodobiKampanjo(d.kampanjaId, skupaj, d.koncano ? "poslano" : "posilja");
    return NextResponse.json({ poslano, skupaj });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
