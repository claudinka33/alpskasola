import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { pridobiAdminaSPravicami } from "@/lib/auth";
import { imaPravico } from "@/lib/pravice";

// Kartica tečajnika — SAMO BRANJE. Ta pot ničesar ne zapisuje v bazo
// in ne pošilja e-pošte; podatke sestavi iz obstoječih tabel.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// Posamezen del kartice naj ne podre celotne kartice (npr. tabela še ne obstaja)
async function varno<T>(fn: () => Promise<T>, privzeto: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return privzeto;
  }
}

export async function GET(req: NextRequest) {
  const admin = await pridobiAdminaSPravicami();
  if (!admin || !imaPravico(admin, "prijave")) {
    return NextResponse.json({ error: "Ni dostopa" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id") || 0);

  try {
    // ---------- Seznam ----------
    if (!id) {
      const q = (searchParams.get("q") || "").trim();
      const program = searchParams.get("program") || "";
      const like = `%${q}%`;
      const r = await sql`
        SELECT p.id, p.program, p.otrok_ime, p.otrok_priimek, p.otrok_rojstvo, p.starsi_ime, p.starsi_priimek,
               p.email, p.telefon, p.status, p.oznaka, p.termin, p.ustvarjeno,
               p.otrok_znanje, p.naslov, p.posta, p.opomba, p.dodatno,
               COALESCE(pr.naziv, p.program) AS program_naziv
        FROM prijave p
        LEFT JOIN programi pr ON pr.slug = p.program
        WHERE (${program} = '' OR p.program = ${program})
          AND (${q} = '' OR p.otrok_ime ILIKE ${like} OR p.otrok_priimek ILIKE ${like}
               OR (p.otrok_ime || ' ' || p.otrok_priimek) ILIKE ${like}
               OR p.starsi_ime ILIKE ${like} OR p.starsi_priimek ILIKE ${like}
               OR p.email ILIKE ${like} OR p.telefon ILIKE ${like})
        ORDER BY p.ustvarjeno DESC
        LIMIT 2000;`;
      const programi = await varno(
        async () =>
          (await sql`SELECT slug, naziv FROM programi ORDER BY COALESCE(vrstni_red, 9999), naziv;`).rows,
        [] as any[]
      );
      return NextResponse.json({ seznam: r.rows, programi });
    }

    // ---------- Kartica ----------
    const pr = await sql`
      SELECT p.*, COALESCE(pg.naziv, p.program) AS program_naziv
      FROM prijave p LEFT JOIN programi pg ON pg.slug = p.program
      WHERE p.id = ${id};`;
    const prijava = pr.rows[0];
    if (!prijava) return NextResponse.json({ error: "Ne obstaja" }, { status: 404 });

    const [termin, ostalePrijave, placila, prisotnost, kontakt] = await Promise.all([
      varno(async () => {
        if (!prijava.termin_id) return null;
        return (await sql`SELECT * FROM termini WHERE id = ${prijava.termin_id};`).rows[0] || null;
      }, null as any),
      // Vse prijave istega otroka (isto ime in priimek pri istem e-naslovu) + bratje in sestre
      varno(
        async () =>
          (
            await sql`
              SELECT p.id, p.program, p.otrok_ime, p.otrok_priimek, p.status, p.termin, p.oznaka, p.ustvarjeno,
                     COALESCE(pg.naziv, p.program) AS program_naziv
              FROM prijave p LEFT JOIN programi pg ON pg.slug = p.program
              WHERE lower(p.email) = lower(${prijava.email})
              ORDER BY p.ustvarjeno DESC;`
          ).rows,
        [] as any[]
      ),
      varno(
        async () =>
          (await sql`SELECT mesec, placano, znesek, datum, opomba, posodobljeno FROM placila WHERE prijava_id = ${id} ORDER BY mesec;`).rows,
        [] as any[]
      ),
      varno(
        async () =>
          (
            await sql`
              SELECT s.datum, s.ucitelji, s.trajanje_min, pr.prisoten, pr.gost, pr.opomba
              FROM prisotnost pr JOIN srecanja s ON s.id = pr.srecanje_id
              WHERE pr.prijava_id = ${id}
              ORDER BY s.datum DESC;`
          ).rows,
        [] as any[]
      ),
      varno(
        async () => (await sql`SELECT ime, priimek, email, telefon, oznake, narocen, vir, ustvarjeno FROM kontakti WHERE lower(email) = lower(${prijava.email});`).rows[0] || null,
        null as any
      ),
    ]);

    return NextResponse.json({ prijava, termin, ostalePrijave, placila, prisotnost, kontakt });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Napaka" }, { status: 500 });
  }
}
