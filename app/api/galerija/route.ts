import { NextRequest, NextResponse } from "next/server";
import { pridobiAdminaSPravicami } from "@/lib/auth";
import { imaPravico } from "@/lib/pravice";
import { shraniDatoteko, pridobiDatoteko, izbrisiDatoteko } from "@/lib/moduli";
import {
  pridobiGalerijo,
  dodajVGalerijo,
  posodobiGalerijo,
  premakniVGaleriji,
  izbrisiIzGalerije,
  youtubeId,
} from "@/lib/galerija";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const NAJVEC = 4 * 1024 * 1024;
const SLIKE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Slike, naložene iz galerije, dobijo to predpono — ob brisanju iz galerije se izbrišejo tudi iz Datotek
const PREDPONA = "galerija-";

async function preveri() {
  const admin = await pridobiAdminaSPravicami();
  return admin && imaPravico(admin, "galerija") ? admin : null;
}

// GET /api/galerija?program=smucarska-akademija — javno
export async function GET(req: NextRequest) {
  try {
    const program = req.nextUrl.searchParams.get("program");
    if (!program) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    const postavke = await pridobiGalerijo(program);
    return NextResponse.json({ postavke });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — slika (multipart: program, datoteka, naslov) ali video (JSON: program, povezava, naslov)
export async function POST(req: NextRequest) {
  try {
    if (!(await preveri())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const tipVsebine = req.headers.get("content-type") || "";

    if (tipVsebine.includes("multipart/form-data")) {
      const form = await req.formData();
      const program = String(form.get("program") || "");
      const f = form.get("datoteka") as File | null;
      const naslov = String(form.get("naslov") || "") || null;
      if (!program || !f) return NextResponse.json({ error: "Manjka program ali slika" }, { status: 400 });
      if (!SLIKE.includes(f.type))
        return NextResponse.json({ error: "Dovoljene so slike JPG, PNG, WEBP, GIF." }, { status: 400 });
      if (f.size > NAJVEC)
        return NextResponse.json({ error: "Slika je prevelika (največ 4 MB)." }, { status: 400 });

      const vsebina = Buffer.from(await f.arrayBuffer());
      const id = await shraniDatoteko({ ime: PREDPONA + f.name, tip: f.type, vsebina });
      const postavka = await dodajVGalerijo({ program_slug: program, tip: "slika", url: `/api/datoteke/${id}`, naslov });
      return NextResponse.json({ uspeh: true, postavka }, { status: 201 });
    }

    const d = await req.json();
    const vid = youtubeId(d.povezava);
    if (!d.program) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    if (!vid) return NextResponse.json({ error: "To ni veljavna YouTube povezava." }, { status: 400 });
    const postavka = await dodajVGalerijo({ program_slug: d.program, tip: "video", url: vid, naslov: d.naslov });
    return NextResponse.json({ uspeh: true, postavka }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — { id, naslov } ali { id, smer: "gor" | "dol" }
export async function PATCH(req: NextRequest) {
  try {
    if (!(await preveri())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const d = await req.json();
    const id = Number(d.id);
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    if (d.smer === "gor" || d.smer === "dol") await premakniVGaleriji(id, d.smer);
    if ("naslov" in d) await posodobiGalerijo(id, { naslov: d.naslov });
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE ?id=
export async function DELETE(req: NextRequest) {
  try {
    if (!(await preveri())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const id = Number(req.nextUrl.searchParams.get("id") || 0);
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    const izbrisana = await izbrisiIzGalerije(id);

    const m = izbrisana?.tip === "slika" ? izbrisana.url.match(/^\/api\/datoteke\/(\d+)$/) : null;
    if (m) {
      const dat = await pridobiDatoteko(Number(m[1]));
      if (dat?.ime?.startsWith(PREDPONA)) await izbrisiDatoteko(Number(m[1]));
    }
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
