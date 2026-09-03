import { pridobiAdminaSPravicami } from "@/lib/auth";
import { imaPravico, smeNaPot, jeAdmin } from "@/lib/pravice";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Mail,
  FileText,
  Settings,
  Users,
  LogOut,
  Send,
  Contact,
  CalendarDays,
  Tag,
  CheckCircle2,
  Euro,
  Clock,
  HardDrive,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await pridobiAdminaSPravicami();
  const pot = headers().get("x-pot") || "/admin";
  const sme = smeNaPot(admin, pot);
  const vidi = (kljuc: string) => imaPravico(admin, kljuc);

  return (
    <div className="min-h-screen bg-slate-50">
      {admin ? (
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-brand-navy text-white min-h-screen p-6 sticky top-0">
            <Link href="/" className="flex items-center gap-2 mb-10">
              <Image
                src="https://assets.cdn.filesafe.space/x59KaDfsCMuhMlks5lOI/media/6a1438ede05851175c7a0326.png"
                alt="Alpska šola"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div>
                <div className="text-sm font-bold">CMS</div>
                <div className="text-[10px] text-white/60">Alpska šola</div>
              </div>
            </Link>

            <nav className="flex flex-col gap-1">
              <NavItem href="/admin" icon={LayoutDashboard} label="Pregled" />

              {(vidi("prijavnica") || vidi("email") || vidi("prijave")) && <Skupina label="Prijavnica" />}
              {vidi("prijavnica") && <NavItem href="/admin/prijavnica" icon={ClipboardList} label="Nastavitve prijavnice" />}
              {vidi("email") && <NavItem href="/admin/email" icon={Mail} label="Sporočilo staršem" />}
              {vidi("prijave") && <NavItem href="/admin/prijave" icon={FileText} label="Oddane prijave" />}

              {(vidi("prisotnost") || vidi("placila") || vidi("ure")) && <Skupina label="Vodenje skupin" />}
              {vidi("prisotnost") && <NavItem href="/admin/prisotnost" icon={CheckCircle2} label="Prisotnost" />}
              {vidi("placila") && <NavItem href="/admin/placila" icon={Euro} label="Plačila" />}
              {vidi("ure") && <NavItem href="/admin/ure" icon={Clock} label="Ure učiteljev" />}

              {(vidi("kontakti") || vidi("kampanje") || vidi("datoteke")) && <Skupina label="Obveščanje" />}
              {vidi("kontakti") && <NavItem href="/admin/kontakti" icon={Contact} label="Kontakti (baza)" />}
              {vidi("kampanje") && <NavItem href="/admin/kampanje" icon={Send} label="Emailing" />}
              {vidi("datoteke") && <NavItem href="/admin/datoteke" icon={HardDrive} label="Datoteke" />}

              {(vidi("termini") || vidi("cenik")) && <Skupina label="Vsebina strani" />}
              {vidi("termini") && <NavItem href="/admin/termini" icon={CalendarDays} label="Termini" />}
              {vidi("cenik") && <NavItem href="/admin/cenik" icon={Tag} label="Cenik" />}

              {(vidi("programi") || vidi("admini")) && <Skupina label="Nastavitve" />}
              {vidi("programi") && <NavItem href="/admin/programi" icon={Settings} label="Programi" />}
              {vidi("admini") && <NavItem href="/admin/admini" icon={Users} label="Uporabniki" />}
            </nav>

            <div className="mt-auto pt-10 border-t border-white/10 mt-10">
              <div className="text-xs text-white/60 mb-2">Prijavljen kot:</div>
              <div className="text-sm font-semibold">{admin.ime}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-4">
                {jeAdmin(admin) ? "Skrbnik" : "Zaposleni"}
              </div>
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 text-xs text-white/70 hover:text-brand-orange transition-colors"
                >
                  <LogOut size={14} /> Odjava
                </button>
              </form>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 p-8">
            {sme ? (
              children
            ) : (
              <div className="max-w-lg mx-auto mt-20 bg-white rounded-2xl border border-slate-200/70 p-8 text-center">
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
      ) : (
        children
      )}
    </div>
  );
}

function Skupina({ label }: { label: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-3 mt-5 mb-1">
      {label}
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
    >
      <Icon size={16} /> {label}
    </Link>
  );
}
