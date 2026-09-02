import { NextRequest, NextResponse } from "next/server";
import {
  pridobiCenik,
  ustvariCenik,
  posodobiCenik,
  nastaviCenikAktiven,
  izbrisiCenik,
} from "@/lib/vsebina";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET /api/cenik?program=sportna-abeceda
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program") || undefined;
    const cenik = await pridobiCenik(program);
    return NextResponse.json({ cenik });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function ocisti(data: any) {
  return {
    program_slug: data.program_slug,
    naziv: data.naziv,
    podnaslov: data.podnaslov || null,
    cena: String(data.cena ?? "").trim(),
    enota: data.enota || null,
    opomba: data.opomba || null,
    vkljuceno: data.vkljuceno || null,
    barva: data.barva || null,
    znacka: data.znacka || null,
    ikona: data.ikona || null,
    lokacija: data.lokacija || null,
    gumb: data.gumb || null,
    gumb_povezava: data.gumb_povezava || null,
    poudarjen: data.poudarjen ?? false,
    aktiven: data.aktiven ?? true,
    vrstni_red:
      data.vrstni_red !== "" && data.vrstni_red != null ? parseInt(data.vrstni_red) : 0,
  };
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.program_slug || !data.naziv) {
      return NextResponse.json({ error: "Manjka program ali naziv" }, { status: 400 });
    }
    const postavka = await ustvariCenik(ocisti(data));
    return NextResponse.json({ uspeh: true, postavka }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    if (data.samoAktiven) {
      await nastaviCenikAktiven(data.id, !!data.aktiven);
      return NextResponse.json({ uspeh: true });
    }
    await posodobiCenik(data.id, ocisti(data));
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiCenik(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
