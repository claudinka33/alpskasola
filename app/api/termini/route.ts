import { NextRequest, NextResponse } from "next/server";
import {
  pridobiTermini,
  pridobiTerminiAktivni,
  ustvariTermin,
  posodobiTermin,
  nastaviTerminAktiven,
  izbrisiTermin,
} from "@/lib/db";

// GET /api/termini?program=plavalni-tecaj          -> vsi termini programa
// GET /api/termini?program=plavalni-tecaj&aktivni=1 -> samo aktivni (za prijavnico)
// GET /api/termini                                  -> vsi termini
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program") || undefined;
    const aktivni = searchParams.get("aktivni");

    const termini =
      aktivni && program
        ? await pridobiTerminiAktivni(program)
        : await pridobiTermini(program);

    return NextResponse.json({ termini });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function ocisti(data: any) {
  return {
    program_slug: data.program_slug,
    naziv: data.naziv,
    lokacija: data.lokacija || null,
    datum_od: data.datum_od || null,
    datum_do: data.datum_do || null,
    cena: data.cena !== "" && data.cena != null ? parseInt(data.cena) : null,
    status: data.status || "odprt",
    aktiven: data.aktiven ?? true,
    sezona: data.sezona || null,
    vrstni_red:
      data.vrstni_red !== "" && data.vrstni_red != null ? parseInt(data.vrstni_red) : 0,
    opomba: data.opomba || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.program_slug || !data.naziv) {
      return NextResponse.json({ error: "Manjka program ali naziv" }, { status: 400 });
    }
    const termin = await ustvariTermin(ocisti(data));
    return NextResponse.json({ uspeh: true, termin }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    // Hiter preklop vidnosti (samo aktiven)
    if (data.samoAktiven) {
      await nastaviTerminAktiven(data.id, !!data.aktiven);
      return NextResponse.json({ uspeh: true });
    }
    await posodobiTermin(data.id, ocisti(data));
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiTermin(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
