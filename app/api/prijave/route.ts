import { NextRequest, NextResponse } from "next/server";
import { ustvariPrijavo, pridobiPrijave, pridobiProgrami, pridobiFormPolja, upsertKontakt } from "@/lib/db";
import { posljiPotrditevStarsu, posljiObvestiloSoli } from "@/lib/email";
import { zagotoviTabele } from "@/lib/migracije";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program") || undefined;
    const status = searchParams.get("status") || undefined;
    const iskanje = searchParams.get("iskanje") || undefined;

    const prijave = await pridobiPrijave({ program, status, iskanje });
    return NextResponse.json({ prijave });
  } catch (error: any) {
    console.error("Napaka pri pridobivanju:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const required = [
      "program", "otrok_ime", "otrok_priimek", "otrok_rojstvo",
      "starsi_ime", "starsi_priimek", "email", "telefon",
    ];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json({ error: `Manjka polje: ${field}` }, { status: 400 });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Neveljaven email" }, { status: 400 });
    }

    // Nastavljiva polja za ta program: preveri obvezna in zberi dodatne vrednosti
    let dodatno: Record<string, string> | null = null;
    let opomba = data.opomba || null;
    try {
      await zagotoviTabele();
      const polja = (await pridobiFormPolja(data.program)).filter((p) => p.viden);
      const vrednosti = (data.dodatno || {}) as Record<string, string>;
      for (const p of polja) {
        const v =
          p.kljuc === "naslov" ? data.naslov :
          p.kljuc === "posta" ? data.posta :
          p.kljuc === "opomba" ? data.opomba :
          p.kljuc === "otrok_znanje" ? data.otrok_znanje :
          vrednosti[p.kljuc];
        if (p.obvezno && (!v || String(v).trim() === "")) {
          return NextResponse.json({ error: `Manjka obvezno polje: ${p.label}` }, { status: 400 });
        }
      }
      const zbrano: Record<string, string> = {};
      for (const p of polja) {
        if (["naslov", "posta", "opomba", "otrok_znanje"].includes(p.kljuc)) continue;
        const v = vrednosti[p.kljuc];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          zbrano[p.label] = String(v);
        }
      }
      if (Object.keys(zbrano).length > 0) {
        dodatno = zbrano;
        // Dodatna polja zapiši tudi v opombo, da so vidna v obstoječih pogledih in emailih
        const vrstice = Object.entries(zbrano).map(([k, v]) => `${k}: ${v}`).join("\n");
        opomba = opomba ? `${vrstice}\n\n${opomba}` : vrstice;
      }
    } catch (e) {
      console.error("Napaka pri nastavljivih poljih:", e);
    }

    const prijava = await ustvariPrijavo(
      {
        program: data.program,
        otrok_ime: data.otrok_ime,
        otrok_priimek: data.otrok_priimek,
        otrok_rojstvo: data.otrok_rojstvo,
        otrok_znanje: data.otrok_znanje || null,
        starsi_ime: data.starsi_ime,
        starsi_priimek: data.starsi_priimek,
        email: data.email,
        telefon: data.telefon,
        naslov: data.naslov || null,
        posta: data.posta || null,
        opomba,
        termin: data.termin || null,
        cena: data.cena || null,
      },
      dodatno
    );

    // Starša samodejno dodaj/posodobi v bazi kontaktov
    try {
      await upsertKontakt({
        ime: data.starsi_ime,
        priimek: data.starsi_priimek,
        email: data.email,
        telefon: data.telefon,
        otrok: `${data.otrok_ime} ${data.otrok_priimek}`,
        oznake: data.program,
        vir: "Prijavnica",
      });
    } catch (e) {
      console.error("Napaka pri shranjevanju kontakta:", e);
    }

    // Pošlji emaila (potrditev staršu + obvestilo šoli).
    // Če email spodleti, prijava vseeno ostane shranjena.
    try {
      const programi = await pridobiProgrami();
      const programNaziv =
        programi.find((p) => p.slug === data.program)?.naziv || data.program;
      await Promise.all([
        posljiPotrditevStarsu(prijava, programNaziv),
        posljiObvestiloSoli(prijava, programNaziv),
      ]);
    } catch (e) {
      console.error("Napaka pri pošiljanju emaila:", e);
    }

    return NextResponse.json({ uspeh: true, prijava }, { status: 201 });
  } catch (error: any) {
    console.error("Napaka pri shranjevanju:", error);
    return NextResponse.json(
      { error: "Napaka pri shranjevanju. Poskusite znova ali pokličite 064 230 888." },
      { status: 500 }
    );
  }
}
