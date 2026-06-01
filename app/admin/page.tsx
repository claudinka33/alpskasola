import { redirect } from "next/navigation";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { pridobiStatistiko, pridobiPrijave } from "@/lib/db";
import Link from "next/link";
import { FileText, CheckCircle2, Clock, DollarSign, ArrowRight, Plus } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) redirect("/admin/login");

  const stats = await pridobiStatistiko();
  const zadnje = (await pridobiPrijave()).slice(0, 5);

  const programLabels: Record<string, string> = {
    "sola-smucanja": "Smučanje",
    "ski-racing-team": "Tekmovalne ekipe",
    "smucarska-akademija": "Akademija",
    "plavalni-tecaj": "Plavanje",
    "sportna-abeceda": "Športna abeceda",
    "sola-rolanja": "Rolanje",
    "praznovanje-rojstnega-dne": "Rojstni dan",
    "servis": "Servis",
    "izposoja-opreme": "Izposoja",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-1">
            Pozdravljen, {admin.ime} 👋
          </h1>
          <p className="text-sm text-slate-600">
            Pregled prijav in statistike Alpske šole.
          </p>
        </div>
        <Link
          href="/admin/prijave/nova"
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
        >
          <Plus size={16} /> Nova prijava
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Vse prijave"
          value={stats.skupaj}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Nove (čakajo)"
          value={stats.nove}
          color="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Potrjene"
          value={stats.potrjene}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Plačane"
          value={stats.placane}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zadnje prijave */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-brand-navy">
              Zadnje prijave
            </h2>
            <Link
              href="/admin/prijave"
              className="text-xs text-brand-orange font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Vse prijave <ArrowRight size={14} />
            </Link>
          </div>

          {zadnje.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText size={36} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Še ni prijav. Bodite potrpežljivi 🎿</p>
            </div>
          ) : (
            <div className="space-y-2">
              {zadnje.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/prijave/${p.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-xs shrink-0">
                      {p.otrok_ime[0]}{p.otrok_priimek[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-brand-navy truncate">
                        {p.otrok_ime} {p.otrok_priimek}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {programLabels[p.program] || p.program} · {p.starsi_ime} {p.starsi_priimek}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Po programih */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6">
          <h2 className="text-lg font-bold text-brand-navy mb-4">
            Po programih
          </h2>
          {stats.poProgramih.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">
              Ni podatkov.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.poProgramih.map((p) => {
                const maxStevilo = Math.max(...stats.poProgramih.map((x) => x.stevilo));
                const procent = (p.stevilo / maxStevilo) * 100;
                return (
                  <div key={p.program}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-brand-navy font-medium">
                        {programLabels[p.program] || p.program}
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {p.stevilo}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-orange rounded-full"
                        style={{ width: `${procent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: "blue" | "green" | "amber" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div className="text-3xl font-extrabold text-brand-navy mb-1">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
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
