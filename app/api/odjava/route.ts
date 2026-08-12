import { NextRequest, NextResponse } from "next/server";
import { odjaviKontakt } from "@/lib/db";
import { odjavaHash } from "@/lib/email";
import { zagotoviTabele } from "@/lib/migracije";

export const dynamic = "force-dynamic";

// GET /api/odjava?e=email&t=hash → odjavi kontakt od obvestil in preusmeri na potrditev
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams;
  const email = sp.get("e") || "";
  const t = sp.get("t") || "";
  const url = req.nextUrl.clone();
  url.search = "";
  if (email && t && t === odjavaHash(email)) {
    try {
      await zagotoviTabele();
      await odjaviKontakt(email);
      url.pathname = "/odjava";
      return NextResponse.redirect(url);
    } catch {
      // pade skozi na napako spodaj
    }
  }
  url.pathname = "/odjava";
  url.search = "?napaka=1";
  return NextResponse.redirect(url);
}
