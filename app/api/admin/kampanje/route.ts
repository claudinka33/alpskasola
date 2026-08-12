import { NextRequest, NextResponse } from "next/server";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { pridobiKampanje, pridobiKontakte, ustvariKampanjo } from "@/lib/db";
import { zagotoviTabele } from "@/lib/migracije";
import { posljiKampanjoPaket } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    await zagotoviTabele();
    return NextResponse.json({ kampanje: await pridobiKampanje() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST → { zadeva, naslov, vsebina, oznaka?, samoNaroceni?, testEmail? }
// Če je podan testEmail, pošlje samo testni email in NE ustvari kampanje.
// Sicer ustvari kampanjo in vrne njen id + število prejemnikov (pošiljanje gre prek /poslji).
export async function POST(req: NextRequest) {
  try {
    const admin = await pridobiTrenutniAdmin();
    if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    await zagotoviTabele();
    const d = await req.json();
    if (!d.zadeva || !d.vsebina) {
      return NextResponse.json({ error: "Manjka zadeva ali vsebina" }, { status: 400 });
    }

    if (d.testEmail) {
      await posljiKampanjoPaket([d.testEmail], `[TEST] ${d.zadeva}`, d.naslov || "", d.vsebina);
      return NextResponse.json({ test: true });
    }

    const kontakti = await pridobiKontakte({
      oznaka: d.oznaka || undefined,
      narocen: d.samoNaroceni === false ? undefined : true,
    });
    const filterOpis = [
      d.oznaka ? `oznaka: ${d.oznaka}` : "vsi kontakti",
      d.samoNaroceni === false ? "vključno z odjavljenimi" : "samo naročeni",
    ].join(", ");

    const kampanja = await ustvariKampanjo({
      zadeva: d.zadeva,
      naslov: d.naslov || null,
      vsebina: d.vsebina,
      filter_opis: filterOpis,
      prejemniki_st: kontakti.length,
    });
    return NextResponse.json({ kampanja, prejemniki: kontakti.map((k) => k.email) }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
