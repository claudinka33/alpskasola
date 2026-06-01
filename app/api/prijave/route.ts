import { NextRequest, NextResponse } from "next/server";
import { ustvariPrijavo, pridobiPrijave } from "@/lib/db";

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

    const prijava = await ustvariPrijavo({
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
      opomba: data.opomba || null,
      termin: data.termin || null,
      cena: data.cena || null,
    });

    return NextResponse.json({ uspeh: true, prijava }, { status: 201 });
  } catch (error: any) {
    console.error("Napaka pri shranjevanju:", error);
    return NextResponse.json(
      { error: "Napaka pri shranjevanju. Poskusite znova ali pokličite 064 230 888." },
      { status: 500 }
    );
  }
}
