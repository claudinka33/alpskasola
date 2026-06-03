import { redirect } from "next/navigation";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  CalendarDays,
  Cake,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await pridobiTrenutniAdmin();

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
                <div className="text-sm font-bold">CRM</div>
                <div className="text-[10px] text-white/60">Alpska šola</div>
              </div>
            </Link>

            <nav className="flex flex-col gap-1">
              <NavItem href="/admin" icon={LayoutDashboard} label="Pregled" />
              <NavItem href="/admin/prijave" icon={FileText} label="Prijavnice" />
              <NavItem href="/admin/programi" icon={Settings} label="Programi" />
              <NavItem href="/admin/termini" icon={CalendarDays} label="Termini" />
              <NavItem href="/admin/rojstni-dan" icon={Cake} label="Rojstni dan" />
              <NavItem href="/admin/admini" icon={Users} label="Uporabniki" />
            </nav>

            <div className="mt-auto pt-10 border-t border-white/10 mt-10">
              <div className="text-xs text-white/60 mb-2">Prijavljen kot:</div>
              <div className="text-sm font-semibold mb-4">{admin.ime}</div>
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
          <main className="flex-1 p-8">{children}</main>
        </div>
      ) : (
        children
      )}
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
