import { NextRequest, NextResponse } from "next/server";
import { pridobiAdminaSPravicami } from "@/lib/auth";
import { imaPravico, jeAdmin } from "@/lib/pravice";
import {
  zagotoviEkipo,
  pridobiOtroke,
  dodajOtroka,
  posodobiOtroka,
  izbrisiOtroka,
  pridobiTreninge,
  odpriDan,
  pridobiDan,
  posodobiTrening,
  izbrisiTrening,
  nastaviPrisotnostOtroka,
  nastaviVsePrisotne,
  statistika,
  pridobiMoznosti,
  shraniDan,
  shraniMoznosti,
} from "@/lib/ekipa";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

async function dostop() {
  const a = await pridobiAdminaSPravicami();
  if (!a || !imaPravico(a, "ekipa")) return null;
  return a;
}

// GET ?akcija=otroci|treningi|dan|statistika&ekipa=U10/U12&datum=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    if (!(await dostop())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    await zagotoviEkipo();
    const q = req.nextUrl.searchParams;
    const akcija = q.get("akcija") || "treningi";
    const ekipa = q.get("ekipa") || "U10/U12";

    if (akcija === "otroci") return NextResponse.json(await pridobiOtroke(ekipa));
    if (akcija === "treningi") return NextResponse.json(await pridobiTreninge(ekipa));
    if (akcija === "dan") return NextResponse.json(await pridobiDan(ekipa, q.get("datum") || ""));
    if (akcija === "statistika") return NextResponse.json(await statistika(ekipa));
    if (akcija === "moznosti") {
      const a = await pridobiAdminaSPravicami();
      return NextResponse.json({ moznosti: await pridobiMoznosti(), admin: jeAdmin(a) });
    }
    return NextResponse.json({ error: "Neznana akcija" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST { akcija, ... }
export async function POST(req: NextRequest) {
  try {
    const admin = await dostop();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    await zagotoviEkipo();
    const b = await req.json();

    switch (b.akcija) {
      case "dodaj-otroka":
        await dodajOtroka(b.ekipa, { ime: b.ime, letnik: b.letnik ? Number(b.letnik) : null, skupina: b.skupina });
        return NextResponse.json({ ok: true });
      case "uredi-otroka":
        await posodobiOtroka(Number(b.id), {
          ime: b.ime,
          aktiven: b.aktiven,
          letnik: b.letnik === undefined ? undefined : b.letnik ? Number(b.letnik) : null,
          skupina: b.skupina,
        });
        return NextResponse.json({ ok: true });
      case "izbrisi-otroka":
        await izbrisiOtroka(Number(b.id));
        return NextResponse.json({ ok: true });
      case "odpri-dan":
        return NextResponse.json(await odpriDan(b.ekipa, b.datum, (admin.ime || "").split(" ")[0]));
      case "uredi-dan":
        await posodobiTrening(Number(b.id), b.polja || {});
        return NextResponse.json({ ok: true });
      case "izbrisi-dan":
        await izbrisiTrening(Number(b.id));
        return NextResponse.json({ ok: true });
      case "prisotnost":
        await nastaviPrisotnostOtroka(Number(b.trening_id), Number(b.otrok_id), !!b.prisoten);
        return NextResponse.json({ ok: true });
      case "vsi-prisotni":
        await nastaviVsePrisotne(Number(b.trening_id), (b.otrok_ids || []).map(Number), !!b.prisoten);
        return NextResponse.json({ ok: true });
      case "shrani-dan": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.datum || ""))) {
          return NextResponse.json({ error: "Napačen datum" }, { status: 400 });
        }
        const id = await shraniDan(b.ekipa, b.datum, b.polja || {}, (b.prisotni || []).map(Number).filter(Boolean));
        return NextResponse.json({ ok: true, id });
      }
      case "shrani-moznosti":
        // Nastavitve možnosti ureja samo admin
        if (!jeAdmin(admin)) return NextResponse.json({ error: "Samo admin lahko ureja nastavitve." }, { status: 403 });
        await shraniMoznosti(b.moznosti);
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "Neznana akcija" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
