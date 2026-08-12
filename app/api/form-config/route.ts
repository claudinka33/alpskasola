import { NextRequest, NextResponse } from "next/server";
import { pridobiFormPolja } from "@/lib/db";
import { zagotoviTabele, zagotoviPoljaZaProgram } from "@/lib/migracije";

export const dynamic = "force-dynamic";

// GET /api/form-config?program=slug → vidna polja prijavnice za program (javno)
export async function GET(req: NextRequest) {
  try {
    const program = new URL(req.url).searchParams.get("program");
    if (!program) return NextResponse.json({ polja: [] });
    await zagotoviTabele();
    await zagotoviPoljaZaProgram(program);
    const polja = (await pridobiFormPolja(program)).filter((p) => p.viden);
    return NextResponse.json({
      polja: polja.map((p) => ({
        kljuc: p.kljuc,
        label: p.label,
        tip: p.tip,
        moznosti: p.moznosti,
        obvezno: p.obvezno,
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ polja: [], error: e.message }, { status: 200 });
  }
}
