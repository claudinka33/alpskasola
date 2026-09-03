import { NextRequest, NextResponse } from "next/server";
import {
  pridobiPlacila,
  nastaviPlacilo,
  pridobiNastavitvePlacil,
  shraniNastavitvePlacil,
} from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET ?program=sportna-abeceda&termin=12
export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    const program = s.get("program");
    if (!program) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    const termin = s.get("termin") ? parseInt(s.get("termin")!) : undefined;
    const [vrstice, nastavitve] = await Promise.all([
      pridobiPlacila(program, termin),
      pridobiNastavitvePlacil(program),
    ]);
    return NextResponse.json({ vrstice, nastavitve });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT { prijava_id, mesec, placano, znesek, datum, opomba }
export async function PUT(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.prijava_id || !d.mesec) {
      return NextResponse.json({ error: "Manjka otrok ali mesec" }, { status: 400 });
    }
    await nastaviPlacilo({
      prijava_id: d.prijava_id,
      mesec: d.mesec,
      placano: !!d.placano,
      znesek: d.znesek !== "" && d.znesek != null ? Number(d.znesek) : null,
      datum: d.datum || null,
      opomba: d.opomba || null,
    });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST -> shrani nastavitve obdobja in privzetega zneska
export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.program_slug) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    await shraniNastavitvePlacil({
      program_slug: d.program_slug,
      mesec_od: d.mesec_od || "2026-10",
      mesec_do: d.mesec_do || "2027-05",
      privzeti_znesek:
        d.privzeti_znesek !== "" && d.privzeti_znesek != null ? Number(d.privzeti_znesek) : null,
    });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
