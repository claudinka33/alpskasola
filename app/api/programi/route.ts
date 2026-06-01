import { NextRequest, NextResponse } from "next/server";
import { pridobiProgrami, ustvariProgram, posodobiProgram, izbrisiProgram } from "@/lib/db";

export async function GET() {
  try {
    const programi = await pridobiProgrami();
    return NextResponse.json({ programi });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, naziv, opis, cena_od } = await req.json();
    if (!slug || !naziv) {
      return NextResponse.json({ error: "Manjka slug ali naziv" }, { status: 400 });
    }
    const program = await ustvariProgram(slug, naziv, opis, cena_od);
    return NextResponse.json({ uspeh: true, program });
  } catch (e: any) {
    if (e.message?.includes("duplicate")) {
      return NextResponse.json({ error: "Slug že obstaja. Izberite drugega." }, { status: 400 });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, naziv, opis, cena_od, aktiven } = await req.json();
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await posodobiProgram(id, { naziv, opis, cena_od, aktiven });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiProgram(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
