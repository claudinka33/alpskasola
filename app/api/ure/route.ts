import { NextRequest, NextResponse } from "next/server";
import { ureUciteljevPodrobno } from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// GET /api/ure?od=2026-09-01&do=2026-09-30
export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    const ure = await ureUciteljevPodrobno(s.get("od") || undefined, s.get("do") || undefined);
    return NextResponse.json({ ure });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
