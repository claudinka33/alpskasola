import { NextRequest, NextResponse } from "next/server";
import { popraviOznakeZaNazaj } from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// POST { program_slug } -> poveže obstoječe prijave s termini in dopiše oznake kontaktom
export async function POST(req: NextRequest) {
  try {
    const { program_slug } = await req.json();
    if (!program_slug) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    const posodobljenih = await popraviOznakeZaNazaj(program_slug);
    return NextResponse.json({ uspeh: true, posodobljenih });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
