import { NextRequest, NextResponse } from "next/server";
import { pridobiPredloge, shraniPredlogo, izbrisiPredlogo } from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json({ predloge: await pridobiPredloge() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.naziv?.trim()) return NextResponse.json({ error: "Manjka naziv predloge" }, { status: 400 });
    const id = await shraniPredlogo({
      id: d.id,
      naziv: d.naziv.trim(),
      zadeva: d.zadeva || "",
      naslov: d.naslov || null,
      vsebina: d.vsebina || "",
      bloki: d.bloki || null,
    });
    return NextResponse.json({ uspeh: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiPredlogo(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
