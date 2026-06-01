import { NextRequest, NextResponse } from "next/server";
import { pridobiAdminPoEmailu } from "@/lib/db";
import { preveriGeslo, ustvariToken, nastaviSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, geslo } = await req.json();

    if (!email || !geslo) {
      return NextResponse.json({ error: "Manjka email ali geslo" }, { status: 400 });
    }

    const admin = await pridobiAdminPoEmailu(email);
    if (!admin) {
      return NextResponse.json({ error: "Napačni podatki" }, { status: 401 });
    }

    const ok = await preveriGeslo(geslo, admin.geslo_hash);
    if (!ok) {
      return NextResponse.json({ error: "Napačni podatki" }, { status: 401 });
    }

    const token = ustvariToken({ id: admin.id, email: admin.email, ime: admin.ime });
    await nastaviSession(token);

    return NextResponse.json({ uspeh: true, ime: admin.ime });
  } catch (error) {
    console.error("Napaka pri prijavi:", error);
    return NextResponse.json({ error: "Napaka strežnika" }, { status: 500 });
  }
}
