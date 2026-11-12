import { NextRequest, NextResponse } from "next/server";
import { izplacilaUciteljev, nastaviIzplacilo } from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const MESEC = /^\d{4}-\d{2}$/;

// GET /api/ure/izplacila?od=2026-09&do=2027-08
export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    const od = s.get("od") || "";
    const do_ = s.get("do") || "";
    if (!MESEC.test(od) || !MESEC.test(do_)) {
      return NextResponse.json({ error: "Napačno obdobje" }, { status: 400 });
    }
    const podatki = await izplacilaUciteljev(od, do_);
    return NextResponse.json(podatki);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT { ime, mesec, izplacano, znesek, datum, opomba }
export async function PUT(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.ime || !MESEC.test(d.mesec || "")) {
      return NextResponse.json({ error: "Manjka učitelj ali mesec" }, { status: 400 });
    }
    await nastaviIzplacilo({
      ime: String(d.ime),
      mesec: d.mesec,
      izplacano: !!d.izplacano,
      znesek: d.znesek !== "" && d.znesek != null ? Number(d.znesek) : null,
      datum: d.datum || null,
      opomba: d.opomba || null,
    });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
