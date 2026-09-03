import { NextRequest, NextResponse } from "next/server";
import { pridobiUcitelje, dodajUcitelja, izbrisiUcitelja } from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json({ ucitelji: await pridobiUcitelje() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ime } = await req.json();
    if (!ime?.trim()) return NextResponse.json({ error: "Manjka ime" }, { status: 400 });
    const ucitelj = await dodajUcitelja(ime);
    return NextResponse.json({ uspeh: true, ucitelj });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiUcitelja(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
