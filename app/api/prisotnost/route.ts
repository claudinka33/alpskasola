import { NextRequest, NextResponse } from "next/server";
import {
  pridobiSrecanja,
  odpriSrecanje,
  pridobiPrisotnost,
  nastaviPrisotnost,
  posodobiSrecanje,
  izbrisiSrecanje,
  dodajGosta,
  odstraniIzSrecanja,
  premakniOtroka,
  povzetekPrisotnosti,
  ureUciteljev,
} from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET ?termin=12                 -> seznam srečanj termina
// GET ?srecanje=5                -> prisotnost enega srečanja
// GET ?povzetek=12               -> % prisotnosti po otroku
// GET ?ure=1&program=..&od=..&do=..  -> ure po učiteljih
export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    if (s.get("ure")) {
      const ure = await ureUciteljev(
        s.get("program") || undefined,
        s.get("od") || undefined,
        s.get("do") || undefined
      );
      return NextResponse.json({ ure });
    }
    if (s.get("povzetek")) {
      return NextResponse.json({ povzetek: await povzetekPrisotnosti(parseInt(s.get("povzetek")!)) });
    }
    if (s.get("srecanje")) {
      return NextResponse.json({ prisotnost: await pridobiPrisotnost(parseInt(s.get("srecanje")!)) });
    }
    if (s.get("termin")) {
      return NextResponse.json({ srecanja: await pridobiSrecanja(parseInt(s.get("termin")!)) });
    }
    return NextResponse.json({ error: "Manjka parameter" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { program_slug, termin_id, datum } -> odpre (ali najde) srečanje
export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.termin_id || !d.datum) {
      return NextResponse.json({ error: "Manjka termin ali datum" }, { status: 400 });
    }
    const srecanje = await odpriSrecanje(d.program_slug, d.termin_id, d.datum);
    return NextResponse.json({ uspeh: true, srecanje });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT { akcija: 'kljukica' | 'srecanje' | 'gost' | 'odstrani' | 'premakni', ... }
export async function PUT(req: NextRequest) {
  try {
    const d = await req.json();
    switch (d.akcija) {
      case "kljukica":
        await nastaviPrisotnost(d.srecanje_id, d.prijava_id, !!d.prisoten);
        break;
      case "srecanje":
        await posodobiSrecanje(d.srecanje_id, {
          ucitelji: d.ucitelji || "",
          trajanje_min: d.trajanje_min ? parseInt(d.trajanje_min) : 60,
          opomba: d.opomba || null,
        });
        break;
      case "gost":
        await dodajGosta(d.srecanje_id, d.prijava_id);
        break;
      case "odstrani":
        await odstraniIzSrecanja(d.srecanje_id, d.prijava_id);
        break;
      case "premakni":
        await premakniOtroka(d.prijava_id, d.termin_id);
        break;
      default:
        return NextResponse.json({ error: "Neznana akcija" }, { status: 400 });
    }
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("srecanje") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiSrecanje(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
