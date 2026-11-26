import { NextRequest, NextResponse } from "next/server";
import { skupinePrograma, ustvariSkupino, urediSkupino, izbrisiSkupino, premakniVecOtrok } from "@/lib/moduli";
import { pridobiAdminaSPravicami } from "@/lib/auth";
import { imaPravico, jeAdmin } from "@/lib/pravice";

export const dynamic = "force-dynamic";

// Ogled: kdor ima pravico do prisotnosti. Urejanje skupin: samo admin.
async function dostop(urejanje: boolean) {
  const a = await pridobiAdminaSPravicami();
  if (!a || !imaPravico(a, "prisotnost")) return NextResponse.json({ error: "Ni dostopa" }, { status: 401 });
  if (urejanje && !jeAdmin(a)) return NextResponse.json({ error: "Skupine ureja samo admin." }, { status: 403 });
  return null;
}

// GET ?program=sola-smucanja -> skupine programa + vsi otroci programa
export async function GET(req: NextRequest) {
  const z = await dostop(false);
  if (z) return z;
  try {
    const program = req.nextUrl.searchParams.get("program");
    if (!program) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    const a = await pridobiAdminaSPravicami();
    return NextResponse.json({ ...(await skupinePrograma(program)), admin: jeAdmin(a) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { program_slug, naziv, ucitelj, dan, ura, lokacija } -> nova skupina
export async function POST(req: NextRequest) {
  const z = await dostop(true);
  if (z) return z;
  try {
    const d = await req.json();
    if (!d.program_slug || !String(d.naziv || "").trim()) {
      return NextResponse.json({ error: "Vpiši ime skupine." }, { status: 400 });
    }
    const id = await ustvariSkupino({ ...d, naziv: String(d.naziv).trim() });
    return NextResponse.json({ uspeh: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT { akcija: "uredi", id, naziv, ... } | { akcija: "premakni", ids: [], termin_id: number|null }
export async function PUT(req: NextRequest) {
  const z = await dostop(true);
  if (z) return z;
  try {
    const d = await req.json();
    if (d.akcija === "premakni") {
      const ids = (Array.isArray(d.ids) ? d.ids : []).map((x: any) => parseInt(x)).filter(Boolean);
      await premakniVecOtrok(ids, d.termin_id ? parseInt(d.termin_id) : null);
    } else if (d.akcija === "uredi") {
      if (!d.id || !String(d.naziv || "").trim()) return NextResponse.json({ error: "Manjka ime" }, { status: 400 });
      await urediSkupino(parseInt(d.id), { ...d, naziv: String(d.naziv).trim() });
    } else {
      return NextResponse.json({ error: "Neznana akcija" }, { status: 400 });
    }
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const z = await dostop(true);
  if (z) return z;
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiSkupino(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
