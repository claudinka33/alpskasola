import { NextRequest, NextResponse } from "next/server";
import { pridobiDatoteko } from "@/lib/moduli";

export const dynamic = "force-dynamic";

// Javno dostopna datoteka — email odjemalci morajo do slike brez prijave.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return new NextResponse("Neveljaven ID", { status: 400 });

  const d = await pridobiDatoteko(id);
  if (!d) return new NextResponse("Ni najdeno", { status: 404 });

  const buf = Buffer.isBuffer(d.vsebina) ? d.vsebina : Buffer.from(d.vsebina as any);

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": d.tip,
      "Content-Disposition": `inline; filename="${encodeURIComponent(d.ime)}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
