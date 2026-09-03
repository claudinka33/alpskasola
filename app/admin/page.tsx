import { redirect } from "next/navigation";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { pridobiStatistiko, pridobiPrijave, pridobiProgrami } from "@/lib/db";
import { pregledTable } from "@/lib/moduli";
import Link from "next/link";
import {
  FileText,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  CheckCircle2,
  MapPin,
  Percent,
  CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) redirect("/admin/login");

  const [stats, vsePrijave, programi, tabla] = await Promise.all([
    pridobiStatistiko(),
    pridobiPrijave(),
    pridobiProgrami(),
    pregledTable().catch(() => null),
  ]);
  const zadnje = vsePrijave.slice(0, 5);

  const naziv = (slug: string) => programi.find((p) => p.slug === slug)?.naziv || slug;

  const danesNiz = new Date().toLocaleDateString("sl-SI", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const vadbe = tabla?.danes || [];
  const nevpisane = vadbe.filter((v) => !v.vpisano).length;

  return (
    <div>
      {/* Glava */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">
            Pozdravljena, {admin.ime.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-600 capitalize">{danesNiz}</p>
        </div>
        <Link
          href="/admin/prijave/nova"
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-orange-dark transition-colors"
        >
          <Plus size={16} /> Nova prijava
        </Link>
      </div>

      {/* Kaj čaka */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kartica
          href="/admin/prisotnost"
          icon={CheckCircle2}
          barva="orange"
          vrednost={String(vadbe.length)}
          label={
            vadbe.length === 0
              ? "Danes ni vadb"
              : nevpisane > 0
              ? `Vadb danes · ${nevpisane} brez prisotnosti`
              : "Vadb danes · vse vpisano"
          }
        />
        <Kartica
          href="/admin/prijave"
          icon={Clock}
          barva="amber"
          vrednost={String(stats.nove)}
          label="Novih prijav čaka"
        />
        <Kartica
          href="/admin/placila"
          icon={AlertTriangle}
          barva="red"
          vrednost={`${Math.round(tabla?.dolg || 0)}€`}
          label={`Neplačano · ${tabla?.dolznikov || 0} dolžnikov`}
        />
        <Kartica
          href="/admin/prisotnost"
          icon={Users}
          barva="blue"
          vrednost={String(tabla?.razporejeni || 0)}
          label={`Otrok v skupinah · ${stats.skupaj} prijav skupaj`}
        />
      </div>

      {/* Vadbe danes */}
      {vadbe.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-6">
          <h2 className="text-lg font-extrabold text-brand-navy mb-4">Danes na sporedu</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vadbe.map((v) => (
              <Link
                key={v.id}
                href="/admin/prisotnost"
                className={`block rounded-xl border-2 p-4 transition-colors ${
                  v.vpisano
                    ? "border-green-200 bg-green-50/60 hover:border-green-300"
                    : "border-orange-200 bg-orange-50/50 hover:border-brand-orange"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <strong className="text-sm text-brand-navy leading-snug">{v.naziv}</strong>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      v.vpisano ? "bg-green-200 text-green-900" : "bg-brand-orange text-white"
                    }`}
                  >
                    {v.vpisano ? "VPISANO" : "VPIŠI"}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>{naziv(v.program_slug)}</div>
                  {v.ura && <div>{v.ura}</div>}
                  {v.lokacija && (
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" /> {v.lokacija}
                    </div>
                  )}
                  <div className="pt-1 font-semibold text-brand-navy">{v.st_otrok} otrok</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Zadnje prijave */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-brand-navy">Zadnje prijave</h2>
            <Link
              href="/admin/prijave"
              className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              Vse prijave <ArrowRight size={13} />
            </Link>
          </div>
          {zadnje.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">Še ni prijav.</p>
          ) : (
            <ul className="space-y-3">
              {zadnje.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs shrink-0">
                    {p.otrok_ime[0]}
                    {p.otrok_priimek[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-brand-navy text-sm truncate">
                      {p.otrok_ime} {p.otrok_priimek}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {naziv(p.program)} · {p.starsi_ime} {p.starsi_priimek}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Skupine */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-brand-navy">Skupine</h2>
            <Link
              href="/admin/prisotnost"
              className="text-xs font-bold text-brand-orange hover:underline inline-flex items-center gap-1"
            >
              Prisotnost <ArrowRight size={13} />
            </Link>
          </div>
          {!tabla || tabla.skupine.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">
              Ni skupin s prijavljenimi otroki.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {tabla.skupine.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-brand-navy truncate">{s.naziv}</div>
                    <div className="text-xs text-slate-500">
                      {s.st_otrok} otrok
                      {s.st_vadb > 0 && (
                        <>
                          {" · "}
                          <CalendarDays size={10} className="inline mb-0.5" /> {s.st_vadb} vadb
                          {s.zadnja_vadba &&
                            ` · zadnja ${new Date(s.zadnja_vadba).toLocaleDateString("sl-SI", {
                              day: "2-digit",
                              month: "2-digit",
                            })}`}
                        </>
                      )}
                    </div>
                  </div>
                  {s.odstotek !== null ? (
                    <span
                      className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                        s.odstotek >= 80
                          ? "bg-green-100 text-green-800"
                          : s.odstotek >= 50
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <Percent size={10} className="inline mr-0.5" />
                      {s.odstotek}
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">
                      NI VADB
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ure učiteljev */}
      {tabla && tabla.ure.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          <h2 className="text-lg font-extrabold text-brand-navy mb-1">Ure učiteljev ta mesec</h2>
          <p className="text-xs text-slate-500 mb-4">Sešteto iz vpisanih vadb od prvega v mesecu.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tabla.ure.map((u) => (
              <div
                key={u.ime}
                className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3"
              >
                <div>
                  <div className="font-semibold text-brand-navy text-sm">{u.ime}</div>
                  <div className="text-xs text-slate-500">{u.srecanj} vadb</div>
                </div>
                <span className="text-lg font-extrabold text-brand-navy">{u.ure} h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Kartica({
  href,
  icon: Icon,
  label,
  vrednost,
  barva,
}: {
  href: string;
  icon: any;
  label: string;
  vrednost: string;
  barva: "blue" | "green" | "amber" | "orange" | "red";
}) {
  const barve = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-brand-orange",
    red: "bg-red-50 text-red-600",
  };
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-slate-200/70 p-5 hover:border-brand-orange hover:shadow-lg hover:shadow-brand-navy/5 transition-all block"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${barve[barva]}`}>
        <Icon size={18} />
      </div>
      <div className="text-3xl font-extrabold text-brand-navy mb-1">{vrednost}</div>
      <div className="text-xs text-slate-500 font-medium leading-snug">{label}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    nova: { label: "Nova", bg: "bg-amber-100", text: "text-amber-800" },
    potrjeno: { label: "Potrjeno", bg: "bg-blue-100", text: "text-blue-800" },
    placano: { label: "Plačano", bg: "bg-green-100", text: "text-green-800" },
    koncano: { label: "Končano", bg: "bg-slate-100", text: "text-slate-700" },
    preklicano: { label: "Preklicano", bg: "bg-red-100", text: "text-red-800" },
  };
  const c = config[status] || config.nova;
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.bg} ${c.text} shrink-0`}>
      {c.label.toUpperCase()}
    </span>
  );
}
