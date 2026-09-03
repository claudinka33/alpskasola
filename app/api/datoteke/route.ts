import { NextRequest, NextResponse } from "next/server";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { pridobiDatoteke, shraniDatoteko, izbrisiDatoteko } from "@/lib/moduli";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// Vercel dovoli do ~4,5 MB na zahtevo — držimo se 4 MB
const NAJVEC = 4 * 1024 * 1024;

const DOVOLJENI = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export async function GET() {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ datoteke: await pridobiDatoteke() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const form = await req.formData();
    const f = form.get("datoteka") as File | null;
    if (!f) return NextResponse.json({ error: "Ni datoteke" }, { status: 400 });

    if (!DOVOLJENI.includes(f.type)) {
      return NextResponse.json(
        { error: "Dovoljene so slike (JPG, PNG, GIF, WEBP) in PDF." },
        { status: 400 }
      );
    }
    if (f.size > NAJVEC) {
      return NextResponse.json(
        { error: `Datoteka je prevelika (${Math.round(f.size / 1024 / 1024)} MB). Največ 4 MB.` },
        { status: 400 }
      );
    }

    const vsebina = Buffer.from(await f.arrayBuffer());
    const id = await shraniDatoteko({ ime: f.name, tip: f.type, vsebina });

    return NextResponse.json({ uspeh: true, id, url: `/api/datoteke/${id}`, ime: f.name, tip: f.type });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const id = parseInt(req.nextUrl.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiDatoteko(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
