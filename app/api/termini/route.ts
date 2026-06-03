import { NextRequest, NextResponse } from "next/server";
import {
  pridobiRdPakete,
  pridobiRdAktivnosti,
  ustvariRdPaket,
  posodobiRdPaket,
  izbrisiRdPaket,
  ustvariRdAktivnost,
  posodobiRdAktivnost,
  izbrisiRdAktivnost,
} from "@/lib/db";

// GET /api/rd-config -> { paketi, aktivnosti }  (prijavnica filtrira aktivne sama)
export async function GET() {
  try {
    const [paketi, aktivnosti] = await Promise.all([
      pridobiRdPakete(),
      pridobiRdAktivnosti(),
    ]);
    return NextResponse.json({ paketi, aktivnosti });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST body: { tip: "paket" | "aktivnost", ... }
export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    if (d.tip === "paket") {
      if (!d.value || !d.label)
        return NextResponse.json({ error: "Manjka value ali label" }, { status: 400 });
      const paket = await ustvariRdPaket({
        value: String(d.value).toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        label: d.label,
        opis: d.opis,
        ima_aktivnosti: !!d.ima_aktivnosti,
        aktiven: d.aktiven ?? true,
        vrstni_red: parseInt(d.vrstni_red) || 0,
      });
      return NextResponse.json({ uspeh: true, paket }, { status: 201 });
    }
    if (d.tip === "aktivnost") {
      if (!d.label) return NextResponse.json({ error: "Manjka label" }, { status: 400 });
      const aktivnost = await ustvariRdAktivnost({
        label: d.label,
        aktiven: d.aktiven ?? true,
        vrstni_red: parseInt(d.vrstni_red) || 0,
      });
      return NextResponse.json({ uspeh: true, aktivnost }, { status: 201 });
    }
    return NextResponse.json({ error: "Neznan tip" }, { status: 400 });
  } catch (e: any) {
    if (e.message?.includes("duplicate"))
      return NextResponse.json({ error: "Ta value že obstaja." }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    if (d.tip === "paket") {
      await posodobiRdPaket(d.id, {
        label: d.label,
        opis: d.opis,
        ima_aktivnosti: !!d.ima_aktivnosti,
        aktiven: d.aktiven ?? true,
        vrstni_red: parseInt(d.vrstni_red) || 0,
      });
    } else if (d.tip === "aktivnost") {
      await posodobiRdAktivnost(d.id, {
        label: d.label,
        aktiven: d.aktiven ?? true,
        vrstni_red: parseInt(d.vrstni_red) || 0,
      });
    } else {
      return NextResponse.json({ error: "Neznan tip" }, { status: 400 });
    }
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/rd-config?tip=paket&id=3
export async function DELETE(req: NextRequest) {
  try {
    const tip = req.nextUrl.searchParams.get("tip");
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    if (tip === "paket") await izbrisiRdPaket(id);
    else if (tip === "aktivnost") await izbrisiRdAktivnost(id);
    else return NextResponse.json({ error: "Neznan tip" }, { status: 400 });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
