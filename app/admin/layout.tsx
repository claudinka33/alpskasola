import { pridobiAdminaSPravicami } from "@/lib/auth";
import { imaPravico, smeNaPot, jeAdmin } from "@/lib/pravice";
import { headers } from "next/headers";
import Link from "next/link";
import Meni, { type Skupina } from "./Meni";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await pridobiAdminaSPravicami();
  const pot = headers().get("x-pot") || "/admin";
  const sme = smeNaPot(admin, pot);
  const vidi = (k: string) => imaPravico(admin, k);

  if (!admin) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  const skupine: Skupina[] = [
    { label: null, postavke: [{ kljuc: "pregled", href: "/admin", label: "Pregled" }] },
    {
      label: "Prijavnica",
      postavke: [
        { kljuc: "prijavnica", href: "/admin/prijavnica", label: "Nastavitve prijavnice" },
        { kljuc: "email", href: "/admin/email", label: "Sporočilo staršem" },
        { kljuc: "prijave", href: "/admin/prijave", label: "Oddane prijave" },
      ].filter((p) => vidi(p.kljuc)),
    },
    {
      label: "Vodenje skupin",
      postavke: [
        { kljuc: "prisotnost", href: "/admin/prisotnost", label: "Prisotnost" },
        { kljuc: "placila", href: "/admin/placila", label: "Plačila" },
        { kljuc: "ure", href: "/admin/ure", label: "Ure učiteljev" },
      ].filter((p) => vidi(p.kljuc)),
    },
    {
      label: "Obveščanje",
      postavke: [
        { kljuc: "kontakti", href: "/admin/kontakti", label: "Kontakti (baza)" },
        { kljuc: "kampanje", href: "/admin/kampanje", label: "Emailing" },
        { kljuc: "datoteke", href: "/admin/datoteke", label: "Datoteke" },
      ].filter((p) => vidi(p.kljuc)),
    },
    {
      label: "Vsebina strani",
      postavke: [
        { kljuc: "termini", href: "/admin/termini", label: "Termini" },
        { kljuc: "cenik", href: "/admin/cenik", label: "Cenik" },
      ].filter((p) => vidi(p.kljuc)),
    },
    {
      label: "Nastavitve",
      postavke: [
        { kljuc: "programi", href: "/admin/programi", label: "Programi" },
        { kljuc: "admini", href: "/admin/admini", label: "Uporabniki" },
      ].filter((p) => vidi(p.kljuc)),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Meni skupine={skupine} ime={admin.ime} vloga={admin.vloga} />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        {sme ? (
          children
        ) : (
          <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl border border-slate-200/70 p-8 text-center">
            <h1 className="text-xl font-extrabold text-brand-navy mb-2">Nimaš dostopa</h1>
            <p className="text-sm text-slate-600 mb-5">
              Ta razdelek ti ni dodeljen. Če ga potrebuješ za svoje delo, se obrni na skrbnika.
            </p>
            <Link
              href="/admin"
              className="inline-block bg-brand-orange text-white px-5 py-2.5 rounded-lg text-sm font-bold"
            >
              Nazaj na pregled
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
