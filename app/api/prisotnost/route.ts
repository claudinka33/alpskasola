import { NextRequest, NextResponse } from "next/server";
import {
  pridobiSrecanja,
  odpriSrecanje,
  pridobiPrisotnost,
  nastaviPrisotnost,
  posodobiSrecanje,
  izbrisiSrecanje,
  shraniVadbo,
  dodajGosta,
  odstraniIzSrecanja,
  premakniOtroka,
  povzetekPrisotnosti,
  ureUciteljev,
  pregledSkupin,
} from "@/lib/moduli";
import { sql } from "@vercel/postgres";
import { pridobiAdminaSPravicami } from "@/lib/auth";
import { jeAdmin } from "@/lib/pravice";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// ---------- ZAKLEP VADBE ----------
// Vadba se zaklene 24 ur po začetku dneva vadbe (oz. 24 ur po odprtju, če je bila
// odprta kasneje). Po zaklepu jo lahko ureja samo admin, ostali jo le vidijo.
type ZaklepInfo = { id: number; zaklenjeno: boolean; zaklene_se: string };

async function zaklepZa(where: { srecanje_id?: number; termin_id?: number }) {
  const r = where.srecanje_id
    ? await sql<ZaklepInfo>`
        SELECT id,
          (now() > GREATEST(ustvarjeno, datum::timestamp AT TIME ZONE 'Europe/Ljubljana') + interval '24 hours') AS zaklenjeno,
          (GREATEST(ustvarjeno, datum::timestamp AT TIME ZONE 'Europe/Ljubljana') + interval '24 hours') AS zaklene_se
        FROM srecanja WHERE id = ${where.srecanje_id};`
    : await sql<ZaklepInfo>`
        SELECT id,
          (now() > GREATEST(ustvarjeno, datum::timestamp AT TIME ZONE 'Europe/Ljubljana') + interval '24 hours') AS zaklenjeno,
          (GREATEST(ustvarjeno, datum::timestamp AT TIME ZONE 'Europe/Ljubljana') + interval '24 hours') AS zaklene_se
        FROM srecanja WHERE termin_id = ${where.termin_id!};`;
  const m = new Map<number, ZaklepInfo>();
  for (const v of r.rows) m.set(v.id, v);
  return m;
}

async function uporabnikJeAdmin() {
  return jeAdmin(await pridobiAdminaSPravicami());
}

// Vrne napako 403, če je vadba zaklenjena in uporabnik ni admin.
async function preveriZaklep(srecanje_id: number) {
  if (!srecanje_id) return null;
  const z = (await zaklepZa({ srecanje_id })).get(srecanje_id);
  if (z?.zaklenjeno && !(await uporabnikJeAdmin())) {
    return NextResponse.json(
      { error: "Vadba je zaklenjena (več kot 24 ur). Spremeni jo lahko samo admin." },
      { status: 403 }
    );
  }
  return null;
}

// GET ?termin=12                 -> seznam srečanj termina
// GET ?srecanje=5                -> prisotnost enega srečanja
// GET ?povzetek=12               -> % prisotnosti po otroku
// GET ?ure=1&program=..&od=..&do=..  -> ure po učiteljih
export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams;
    if (s.get("pregled")) {
      return NextResponse.json({ skupine: await pregledSkupin() });
    }
    if (s.get("ure")) {
      const ure = await ureUciteljev(
        s.get("program") || undefined,
        s.get("od") || undefined,
        s.get("do") || undefined
      );
      return NextResponse.json({ ure });
    }
    if (s.get("povzetek")) {
      return NextResponse.json({ povzetek: await povzetekPrisotnosti(parseInt(s.get("povzetek")!)) });
    }
    if (s.get("srecanje")) {
      const id = parseInt(s.get("srecanje")!);
      const z = (await zaklepZa({ srecanje_id: id })).get(id);
      return NextResponse.json({
        prisotnost: await pridobiPrisotnost(id),
        zaklenjeno: !!z?.zaklenjeno,
        zaklene_se: z?.zaklene_se || null,
        admin: await uporabnikJeAdmin(),
      });
    }
    if (s.get("termin")) {
      const termin_id = parseInt(s.get("termin")!);
      const srecanja = await pridobiSrecanja(termin_id);
      const zaklep = await zaklepZa({ termin_id });
      return NextResponse.json({
        srecanja: srecanja.map((x) => ({
          ...x,
          zaklenjeno: !!zaklep.get(x.id)?.zaklenjeno,
          zaklene_se: zaklep.get(x.id)?.zaklene_se || null,
        })),
        admin: await uporabnikJeAdmin(),
      });
    }
    return NextResponse.json({ error: "Manjka parameter" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { program_slug, termin_id, datum } -> odpre (ali najde) srečanje
export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    if (!d.termin_id || !d.datum) {
      return NextResponse.json({ error: "Manjka termin ali datum" }, { status: 400 });
    }
    const srecanje = await odpriSrecanje(d.program_slug, d.termin_id, d.datum);
    const z = (await zaklepZa({ srecanje_id: srecanje.id })).get(srecanje.id);
    return NextResponse.json({
      uspeh: true,
      srecanje: { ...srecanje, zaklenjeno: !!z?.zaklenjeno, zaklene_se: z?.zaklene_se || null },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT { akcija: 'kljukica' | 'srecanje' | 'gost' | 'odstrani' | 'premakni', ... }
export async function PUT(req: NextRequest) {
  try {
    const d = await req.json();
    if (d.akcija !== "premakni") {
      const zavrnitev = await preveriZaklep(parseInt(d.srecanje_id) || 0);
      if (zavrnitev) return zavrnitev;
    }
    switch (d.akcija) {
      case "kljukica":
        await nastaviPrisotnost(d.srecanje_id, d.prijava_id, !!d.prisoten);
        break;
      case "srecanje":
        await posodobiSrecanje(d.srecanje_id, {
          ucitelji: d.ucitelji || "",
          trajanje_min: d.trajanje_min ? parseInt(d.trajanje_min) : 60,
          opomba: d.opomba || null,
        });
        break;
      case "shrani":
        await shraniVadbo({
          srecanje_id: d.srecanje_id,
          ucitelji: d.ucitelji || "",
          trajanje_min: d.trajanje_min ? parseInt(d.trajanje_min) : 60,
          opomba: d.opomba || null,
          prisotnost: Array.isArray(d.prisotnost) ? d.prisotnost : [],
        });
        break;
      case "gost":
        await dodajGosta(d.srecanje_id, d.prijava_id);
        break;
      case "odstrani":
        await odstraniIzSrecanja(d.srecanje_id, d.prijava_id);
        break;
      case "premakni":
        await premakniOtroka(d.prijava_id, d.termin_id);
        break;
      default:
        return NextResponse.json({ error: "Neznana akcija" }, { status: 400 });
    }
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = parseInt(req.nextUrl.searchParams.get("srecanje") || "0");
    if (!id) return NextResponse.json({ error: "Manjka id" }, { status: 400 });
    const zavrnitev = await preveriZaklep(id);
    if (zavrnitev) return zavrnitev;
    await izbrisiSrecanje(id);
    return NextResponse.json({ uspeh: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
