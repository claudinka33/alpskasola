import { NextRequest, NextResponse } from "next/server";
import { pridobiCenikSekcijo, shraniCenikSekcijo } from "@/lib/vsebina";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET /api/cenik-sekcija?program=sola-smucanja
export async function GET(req: NextRequest) {
  try {
    const program = new URL(req.url).searchParams.get("program");
    if (!program) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    const sekcija = await pridobiCenikSekcijo(program);
    return NextResponse.json({ sekcija });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.program_slug) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    await shraniCenikSekcijo({
      program_slug: d.program_slug,
      badge: d.badge || null,
      naslov: d.naslov || null,
      podnaslov: d.podnaslov || null,
      opomba_spodaj: d.opomba_spodaj || null,
    });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
