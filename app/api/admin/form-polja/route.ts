import { NextRequest, NextResponse } from "next/server";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { pridobiFormPolja, ustvariFormPolje, posodobiFormPolje, izbrisiFormPolje } from "@/lib/db";
import { zagotoviTabele, zagotoviPoljaZaProgram } from "@/lib/migracije";

export const dynamic = "force-dynamic";

async function zahtevajAdmina() {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) throw new Error("unauthorized");
  return admin;
}

export async function GET(req: NextRequest) {
  try {
    await zahtevajAdmina();
    const program = new URL(req.url).searchParams.get("program");
    if (!program) return NextResponse.json({ error: "Manjka program" }, { status: 400 });
    await zagotoviTabele();
    await zagotoviPoljaZaProgram(program);
    return NextResponse.json({ polja: await pridobiFormPolja(program) });
  } catch (e: any) {
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}

// POST → novo polje po meri { program_slug, label, tip, moznosti, obvezno }
export async function POST(req: NextRequest) {
  try {
    await zahtevajAdmina();
    await zagotoviTabele();
    const d = await req.json();
    if (!d.program_slug || !d.label) {
      return NextResponse.json({ error: "Manjka naziv polja" }, { status: 400 });
    }
    const kljuc =
      "polje_" +
      d.label
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 40);
    const polje = await ustvariFormPolje({
      program_slug: d.program_slug,
      kljuc,
      label: d.label,
      tip: d.tip || "text",
      moznosti: d.moznosti || null,
      obvezno: !!d.obvezno,
      viden: true,
    });
    return NextResponse.json({ polje }, { status: 201 });
  } catch (e: any) {
    if (String(e.message).includes("duplicate")) {
      return NextResponse.json({ error: "Polje s tem nazivom že obstaja." }, { status: 400 });
    }
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}

// PUT → posodobi polje { id, ...spremembe }
export async function PUT(req: NextRequest) {
  try {
    await zahtevajAdmina();
    const d = await req.json();
    if (!d.id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await posodobiFormPolje(d.id, d);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}

// DELETE → izbriši polje po meri (sistemskih ni mogoče brisati)
export async function DELETE(req: NextRequest) {
  try {
    await zahtevajAdmina();
    const id = Number(new URL(req.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    await izbrisiFormPolje(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const st = e.message === "unauthorized" ? 401 : 500;
    return NextResponse.json({ error: e.message }, { status: st });
  }
}
