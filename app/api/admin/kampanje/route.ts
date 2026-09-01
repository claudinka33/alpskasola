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

// POST → { zadeva, naslov, vsebina, oznake?: string[], oznaka?: string, samoNaroceni?, testEmail? }
// Če je podan testEmail, pošlje samo testni email in NE ustvari kampanje.
// Sicer ustvari kampanjo in vrne njen id + seznam prejemnikov (pošiljanje gre prek /poslji).
// Podpira več oznak hkrati — prejemniki so unikatni po emailu.
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

    // Sprejmi novo obliko (oznake: string[]) in staro (oznaka: string)
    const oznake: string[] = Array.isArray(d.oznake)
      ? d.oznake.map((o: any) => String(o).trim()).filter(Boolean)
      : d.oznaka
      ? [String(d.oznaka).trim()].filter(Boolean)
      : [];

    const narocen = d.samoNaroceni === false ? undefined : true;

    // Zberi kontakte za vse izbrane oznake in odstrani podvojene emaile
    const zbrani = new Map<string, any>();
    const dodaj = (seznam: any[]) => {
      for (const k of seznam) {
        const e = String(k?.email || "").trim().toLowerCase();
        if (!e || zbrani.has(e)) continue;
        zbrani.set(e, k);
      }
    };

    if (oznake.length === 0) {
      dodaj(await pridobiKontakte({ narocen }));
    } else {
      for (const o of oznake) {
        dodaj(await pridobiKontakte({ oznaka: o, narocen }));
      }
    }

    const prejemniki = Array.from(zbrani.keys());

    if (prejemniki.length === 0) {
      return NextResponse.json({ error: "Ni prejemnikov za izbrane filtre." }, { status: 400 });
    }

    const filterOpis = [
      oznake.length === 0 ? "vsi kontakti" : `oznake: ${oznake.join(" + ")}`,
      d.samoNaroceni === false ? "vključno z odjavljenimi" : "samo naročeni",
    ].join(", ");

    const kampanja = await ustvariKampanjo({
      zadeva: d.zadeva,
      naslov: d.naslov || null,
      vsebina: d.vsebina,
      filter_opis: filterOpis,
      prejemniki_st: prejemniki.length,
    });

    return NextResponse.json({ kampanja, prejemniki }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
